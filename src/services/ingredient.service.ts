import { isAdmin } from "@/lib/auth/admin";
import { ContentStatus } from "@/lib/database/constants";
import type { FAQItem, JsonValue } from "@/lib/database/types";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { INGREDIENT_IMPORT_BATCH_SIZE, type IngredientCsvRow, csvRowToIngredientPayload } from "@/lib/ingredients/csv";
import { getIngredientQualityWarnings } from "@/lib/ingredients/data-quality";
import {
  type IngredientCreateInput,
  type IngredientUpdateInput,
  validateIngredientInput,
} from "@/lib/validators/ingredient.validator";
import {
  SupabaseIngredientsRepository,
  type IngredientsRepository,
} from "@/repositories/ingredients.repository";
import { AuthorsService, ReviewersService } from "@/services/expert-profiles.service";

export type IngredientImportError = {
  rowNumber: number;
  slug: string | null;
  message: string;
};

export type IngredientImportWarning = {
  rowNumber: number;
  slug: string | null;
  warnings: string[];
};

export type IngredientImportSummary = {
  totalRows: number;
  batchesProcessed: number;
  created: number;
  skipped: number;
  conflicts: number;
  validationErrors: number;
  warnings: number;
};

type IngredientImportRow = {
  rowNumber: number;
  row: IngredientCsvRow;
};

export class IngredientService {
  private readonly authorsService = new AuthorsService();
  private readonly reviewersService = new ReviewersService();

  constructor(
    private readonly ingredientsRepository: IngredientsRepository = new SupabaseIngredientsRepository(),
  ) {}

  get repository() {
    return this.ingredientsRepository;
  }

  async getAllIngredients() {
    return this.ingredientsRepository.getAllIngredients();
  }

  async getPublishedIngredients() {
    return this.ingredientsRepository.getPublishedIngredients();
  }

  async getIngredientById(id: string) {
    const ingredient = await this.ingredientsRepository.getIngredientById(id);

    if (!ingredient) {
      throw new AppError("Ingredient not found.", "INGREDIENT_NOT_FOUND", 404);
    }

    return ingredient;
  }

  async getIngredientBySlug(slug: string) {
    const ingredient = await this.ingredientsRepository.getIngredientBySlug(slug);

    if (!ingredient) {
      throw new AppError("Ingredient not found.", "INGREDIENT_NOT_FOUND", 404);
    }

    return ingredient;
  }

  async getPublishedIngredientBySlug(slug: string) {
    const ingredient = await this.ingredientsRepository.getPublishedIngredientBySlug(slug);

    if (!ingredient) {
      throw new AppError("Ingredient not found.", "INGREDIENT_NOT_FOUND", 404);
    }

    return ingredient;
  }

  async searchIngredients(query: string) {
    return this.ingredientsRepository.searchIngredients(query);
  }

  async searchPublishedIngredients(query: string) {
    return this.ingredientsRepository.searchPublishedIngredients(query);
  }

  async getFeaturedIngredients() {
    return this.ingredientsRepository.getFeaturedIngredients();
  }

  async getRelatedProductsForIngredient(ingredientId: string) {
    return this.ingredientsRepository.getRelatedProductsForIngredient(ingredientId);
  }

  async getIngredientsForProduct(productId: string) {
    return this.ingredientsRepository.getIngredientsForProduct(productId);
  }

  async importIngredients(rows: IngredientImportRow[]) {
    await this.ensureAdminAccess();

    if (!rows.length) {
      return {
        summary: {
          totalRows: 0,
          batchesProcessed: 0,
          created: 0,
          skipped: 0,
          conflicts: 0,
          validationErrors: 0,
          warnings: 0,
        } satisfies IngredientImportSummary,
        errors: [] as IngredientImportError[],
        warnings: [] as IngredientImportWarning[],
      };
    }

    const existingIngredients = await this.ingredientsRepository.getAllIngredients();
    const existingSlugs = new Set(existingIngredients.map((ingredient) => ingredient.slug));
    const importedSlugs = new Set<string>();
    const errors: IngredientImportError[] = [];
    const warnings: IngredientImportWarning[] = [];
    const validRows: Array<{ rowNumber: number; payload: IngredientCreateInput }> = [];
    let conflicts = 0;
    let validationErrors = 0;

    for (const entry of rows) {
      const { payload, errors: rowErrors } = csvRowToIngredientPayload(entry.row);
      const normalizedPayload = await this.normalizeCreateInput(payload);
      const validationMessages = [...rowErrors];

      if (!normalizedPayload.name.trim()) {
        validationMessages.push("name is required.");
      }

      if (!normalizedPayload.slug) {
        validationMessages.push("slug is required.");
      }

      const validationResult = validateIngredientInput(normalizedPayload, "create");
      if (!validationResult.success) {
        validationMessages.push(...validationResult.errors);
      }

      if (normalizedPayload.slug && existingSlugs.has(normalizedPayload.slug)) {
        validationMessages.push(`slug "${normalizedPayload.slug}" already exists.`);
        conflicts += 1;
      }

      if (normalizedPayload.slug && importedSlugs.has(normalizedPayload.slug)) {
        validationMessages.push(`duplicate slug "${normalizedPayload.slug}" found in this import.`);
        conflicts += 1;
      }

      if (validationMessages.length) {
        validationErrors += 1;
        errors.push({
          rowNumber: entry.rowNumber,
          slug: normalizedPayload.slug ?? null,
          message: [...new Set(validationMessages)].join(" "),
        });
        continue;
      }

      importedSlugs.add(normalizedPayload.slug!);
      existingSlugs.add(normalizedPayload.slug!);
      validRows.push({ rowNumber: entry.rowNumber, payload: normalizedPayload });

      const qualityWarnings = getIngredientQualityWarnings(normalizedPayload);
      if (qualityWarnings.length) {
        warnings.push({
          rowNumber: entry.rowNumber,
          slug: normalizedPayload.slug ?? null,
          warnings: qualityWarnings,
        });
      }
    }

    let created = 0;
    let batchesProcessed = 0;

    for (let index = 0; index < validRows.length; index += INGREDIENT_IMPORT_BATCH_SIZE) {
      const batch = validRows.slice(index, index + INGREDIENT_IMPORT_BATCH_SIZE);
      if (!batch.length) {
        continue;
      }

      batchesProcessed += 1;

      try {
        const inserted = await this.ingredientsRepository.bulkCreateIngredients(
          batch.map((item) => item.payload),
        );
        const insertedBySlug = new Map(inserted.map((ingredient) => [ingredient.slug, ingredient]));

        for (const item of batch) {
          const insertedIngredient = item.payload.slug
            ? insertedBySlug.get(item.payload.slug)
            : null;

          if (insertedIngredient && item.payload.product_ids?.length) {
            await this.ingredientsRepository.replaceProductRelationships(
              insertedIngredient.id,
              item.payload.product_ids,
            );
          }
        }

        created += inserted.length;
      } catch {
        for (const item of batch) {
          try {
            const ingredient = await this.ingredientsRepository.createIngredient(item.payload);

            if (item.payload.product_ids?.length) {
              await this.ingredientsRepository.replaceProductRelationships(
                ingredient.id,
                item.payload.product_ids,
              );
            }

            created += 1;
          } catch (error) {
            errors.push({
              rowNumber: item.rowNumber,
              slug: item.payload.slug ?? null,
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to create ingredient during batch import.",
            });
          }
        }
      }
    }

    return {
      summary: {
        totalRows: rows.length,
        batchesProcessed,
        created,
        skipped: rows.length - created,
        conflicts,
        validationErrors,
        warnings: warnings.length,
      } satisfies IngredientImportSummary,
      errors,
      warnings,
    };
  }

  async createIngredient(input: IngredientCreateInput) {
    await this.ensureAdminAccess();
    const normalizedInput = await this.normalizeCreateInput(input);
    this.assertValid(normalizedInput, "create");
    await this.assertUniqueSlug(normalizedInput.slug);

    const ingredient = await this.ingredientsRepository.createIngredient(normalizedInput);
    await this.ingredientsRepository.replaceProductRelationships(
      ingredient.id,
      normalizedInput.product_ids ?? [],
    );

    return ingredient;
  }

  async updateIngredient(id: string, input: IngredientUpdateInput) {
    await this.ensureAdminAccess();
    await this.getIngredientById(id);
    const normalizedInput = await this.normalizeUpdateInput(input);
    this.assertValid(normalizedInput, "update");

    if (normalizedInput.slug) {
      await this.assertUniqueSlug(normalizedInput.slug, id);
    }

    const ingredient = await this.ingredientsRepository.updateIngredient(id, normalizedInput);

    if ("product_ids" in normalizedInput) {
      await this.ingredientsRepository.replaceProductRelationships(
        ingredient.id,
        normalizedInput.product_ids ?? [],
      );
    }

    return ingredient;
  }

  async deleteIngredient(id: string) {
    await this.ensureAdminAccess();
    await this.getIngredientById(id);
    await this.ingredientsRepository.deleteIngredient(id);
  }

  private async normalizeCreateInput(
    input: IngredientCreateInput,
  ): Promise<IngredientCreateInput> {
    const name = input.name.trim();
    const slug = input.slug?.trim() || this.createSlug(name);

    return {
      ...input,
      name,
      slug,
      status: input.status ?? ContentStatus.Draft,
      author_id: await this.authorsService.resolveAssignedProfileId(input.author_id),
      reviewer_id: await this.reviewersService.resolveAssignedProfileId(input.reviewer_id),
      scientific_name: this.cleanText(input.scientific_name),
      ingredient_category: this.cleanText(input.ingredient_category),
      short_description: this.cleanText(input.short_description),
      full_description: this.cleanText(input.full_description),
      image_url: this.cleanText(input.image_url),
      rating: input.rating ?? null,
      evidence_level: this.cleanText(input.evidence_level),
      origin_country: this.cleanText(input.origin_country),
      part_used: this.cleanText(input.part_used),
      ingredient_form: this.cleanText(input.ingredient_form),
      taste_profile: this.cleanText(input.taste_profile),
      typical_dose: this.cleanText(input.typical_dose),
      best_for: this.cleanText(input.best_for),
      safety_level: this.cleanText(input.safety_level),
      overview_content: this.cleanText(input.overview_content),
      how_it_works_content: this.cleanText(input.how_it_works_content),
      interesting_fact: this.cleanText(input.interesting_fact),
      benefits: this.cleanList(input.benefits),
      side_effects: this.cleanList(input.side_effects),
      dosage: this.cleanText(input.dosage),
      scientific_notes: this.cleanText(input.scientific_notes),
      benefits_json: this.cleanJsonArray(input.benefits_json),
      side_effects_json: this.cleanJsonArray(input.side_effects_json),
      drug_interactions_json: this.cleanJsonArray(input.drug_interactions_json),
      who_should_avoid_json: this.cleanJsonArray(input.who_should_avoid_json),
      faq_json: this.cleanFaqItems(input.faq_json),
      related_ingredients_json: this.cleanJsonArray(input.related_ingredients_json),
      featured_image: this.cleanText(input.featured_image),
      meta_title: this.cleanText(input.meta_title),
      meta_description: this.cleanText(input.meta_description),
      seo_title: this.cleanText(input.seo_title),
      seo_description: this.cleanText(input.seo_description),
      is_featured: input.is_featured ?? false,
      product_ids: this.cleanList(input.product_ids),
    };
  }

  private async normalizeUpdateInput(
    input: IngredientUpdateInput,
  ): Promise<IngredientUpdateInput> {
    const name = input.name?.trim();
    const slug = input.slug?.trim() || (name ? this.createSlug(name) : undefined);

    return {
      ...input,
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
      ...("status" in input ? { status: input.status ?? ContentStatus.Draft } : {}),
      ...("author_id" in input
        ? {
            author_id: await this.authorsService.resolveAssignedProfileId(input.author_id),
          }
        : {}),
      ...("reviewer_id" in input
        ? {
            reviewer_id: await this.reviewersService.resolveAssignedProfileId(
              input.reviewer_id,
            ),
          }
        : {}),
      ...("scientific_name" in input
        ? { scientific_name: this.cleanText(input.scientific_name) }
        : {}),
      ...("ingredient_category" in input
        ? { ingredient_category: this.cleanText(input.ingredient_category) }
        : {}),
      ...("short_description" in input
        ? { short_description: this.cleanText(input.short_description) }
        : {}),
      ...("full_description" in input
        ? { full_description: this.cleanText(input.full_description) }
        : {}),
      ...("image_url" in input ? { image_url: this.cleanText(input.image_url) } : {}),
      ...("rating" in input ? { rating: input.rating ?? null } : {}),
      ...("evidence_level" in input
        ? { evidence_level: this.cleanText(input.evidence_level) }
        : {}),
      ...("origin_country" in input
        ? { origin_country: this.cleanText(input.origin_country) }
        : {}),
      ...("part_used" in input ? { part_used: this.cleanText(input.part_used) } : {}),
      ...("ingredient_form" in input
        ? { ingredient_form: this.cleanText(input.ingredient_form) }
        : {}),
      ...("taste_profile" in input
        ? { taste_profile: this.cleanText(input.taste_profile) }
        : {}),
      ...("typical_dose" in input
        ? { typical_dose: this.cleanText(input.typical_dose) }
        : {}),
      ...("best_for" in input ? { best_for: this.cleanText(input.best_for) } : {}),
      ...("safety_level" in input
        ? { safety_level: this.cleanText(input.safety_level) }
        : {}),
      ...("overview_content" in input
        ? { overview_content: this.cleanText(input.overview_content) }
        : {}),
      ...("how_it_works_content" in input
        ? { how_it_works_content: this.cleanText(input.how_it_works_content) }
        : {}),
      ...("interesting_fact" in input
        ? { interesting_fact: this.cleanText(input.interesting_fact) }
        : {}),
      ...("benefits" in input ? { benefits: this.cleanList(input.benefits) } : {}),
      ...("side_effects" in input
        ? { side_effects: this.cleanList(input.side_effects) }
        : {}),
      ...("dosage" in input ? { dosage: this.cleanText(input.dosage) } : {}),
      ...("scientific_notes" in input
        ? { scientific_notes: this.cleanText(input.scientific_notes) }
        : {}),
      ...("benefits_json" in input
        ? { benefits_json: this.cleanJsonArray(input.benefits_json) }
        : {}),
      ...("side_effects_json" in input
        ? { side_effects_json: this.cleanJsonArray(input.side_effects_json) }
        : {}),
      ...("drug_interactions_json" in input
        ? { drug_interactions_json: this.cleanJsonArray(input.drug_interactions_json) }
        : {}),
      ...("who_should_avoid_json" in input
        ? { who_should_avoid_json: this.cleanJsonArray(input.who_should_avoid_json) }
        : {}),
      ...("faq_json" in input ? { faq_json: this.cleanFaqItems(input.faq_json) } : {}),
      ...("related_ingredients_json" in input
        ? { related_ingredients_json: this.cleanJsonArray(input.related_ingredients_json) }
        : {}),
      ...("featured_image" in input
        ? { featured_image: this.cleanText(input.featured_image) }
        : {}),
      ...("meta_title" in input ? { meta_title: this.cleanText(input.meta_title) } : {}),
      ...("meta_description" in input
        ? { meta_description: this.cleanText(input.meta_description) }
        : {}),
      ...("seo_title" in input ? { seo_title: this.cleanText(input.seo_title) } : {}),
      ...("seo_description" in input
        ? { seo_description: this.cleanText(input.seo_description) }
        : {}),
      ...("product_ids" in input ? { product_ids: this.cleanList(input.product_ids) } : {}),
    };
  }

  private async assertUniqueSlug(slug: string | undefined, currentIngredientId?: string) {
    if (!slug) {
      throw new ValidationError("Ingredient slug is required.");
    }

    const existingIngredient = await this.ingredientsRepository.getIngredientBySlug(slug);

    if (existingIngredient && existingIngredient.id !== currentIngredientId) {
      throw new ValidationError("An ingredient with this slug already exists.");
    }
  }

  private assertValid(
    input: IngredientCreateInput | IngredientUpdateInput,
    mode: "create" | "update",
  ) {
    const result = validateIngredientInput(input, mode);

    if (!result.success) {
      throw new ValidationError(result.errors.join(" "));
    }
  }

  private async ensureAdminAccess() {
    const allowed = await isAdmin();

    if (!allowed) {
      throw new AppError("Admin access is required.", "ADMIN_REQUIRED", 403);
    }
  }

  private createSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private cleanList(values: string[] | undefined) {
    return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
  }

  private cleanText(value: string | null | undefined) {
    const normalizedValue = value?.trim();

    return normalizedValue ? normalizedValue : null;
  }

  private cleanJsonArray(values: JsonValue[] | undefined) {
    return Array.isArray(values) ? [...values] : [];
  }

  private cleanFaqItems(values: FAQItem[] | undefined) {
    return (values ?? [])
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question && item.answer);
  }
}
