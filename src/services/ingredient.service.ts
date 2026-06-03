import { isAdmin } from "@/lib/auth/admin";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type IngredientCreateInput,
  type IngredientUpdateInput,
  validateIngredientInput,
} from "@/lib/validators/ingredient.validator";
import {
  SupabaseIngredientsRepository,
  type IngredientsRepository,
} from "@/repositories/ingredients.repository";

export class IngredientService {
  constructor(
    private readonly ingredientsRepository: IngredientsRepository = new SupabaseIngredientsRepository(),
  ) {}

  get repository() {
    return this.ingredientsRepository;
  }

  async getAllIngredients() {
    return this.ingredientsRepository.getAllIngredients();
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

  async searchIngredients(query: string) {
    return this.ingredientsRepository.searchIngredients(query);
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

  async createIngredient(input: IngredientCreateInput) {
    await this.ensureAdminAccess();
    const normalizedInput = this.normalizeCreateInput(input);
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
    const normalizedInput = this.normalizeUpdateInput(input);
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

  private normalizeCreateInput(input: IngredientCreateInput): IngredientCreateInput {
    const name = input.name.trim();
    const slug = input.slug?.trim() || this.createSlug(name);

    return {
      ...input,
      name,
      slug,
      short_description: input.short_description?.trim() || null,
      full_description: input.full_description?.trim() || null,
      benefits: this.cleanList(input.benefits),
      side_effects: this.cleanList(input.side_effects),
      dosage: input.dosage?.trim() || null,
      scientific_notes: input.scientific_notes?.trim() || null,
      featured_image: input.featured_image?.trim() || null,
      meta_title: input.meta_title?.trim() || null,
      meta_description: input.meta_description?.trim() || null,
      is_featured: input.is_featured ?? false,
      product_ids: this.cleanList(input.product_ids),
    };
  }

  private normalizeUpdateInput(input: IngredientUpdateInput): IngredientUpdateInput {
    const name = input.name?.trim();
    const slug = input.slug?.trim() || (name ? this.createSlug(name) : undefined);

    return {
      ...input,
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
      ...("short_description" in input
        ? { short_description: input.short_description?.trim() || null }
        : {}),
      ...("full_description" in input
        ? { full_description: input.full_description?.trim() || null }
        : {}),
      ...("benefits" in input ? { benefits: this.cleanList(input.benefits) } : {}),
      ...("side_effects" in input
        ? { side_effects: this.cleanList(input.side_effects) }
        : {}),
      ...("dosage" in input ? { dosage: input.dosage?.trim() || null } : {}),
      ...("scientific_notes" in input
        ? { scientific_notes: input.scientific_notes?.trim() || null }
        : {}),
      ...("featured_image" in input
        ? { featured_image: input.featured_image?.trim() || null }
        : {}),
      ...("meta_title" in input ? { meta_title: input.meta_title?.trim() || null } : {}),
      ...("meta_description" in input
        ? { meta_description: input.meta_description?.trim() || null }
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
}
