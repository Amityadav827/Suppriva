import { ContentStatus } from "@/lib/database/constants";
import type {
  Category,
  FAQItem,
  Ingredient,
  Product,
  ProductImportLog,
  ProductIngredient,
} from "@/lib/database/types";
import {
  normalizeImportStatus,
  parseImportFaq,
  splitPipeValues,
  type ParsedProductImportRow,
} from "@/lib/products/import-csv";
import {
  SupabaseCategoriesRepository,
  type CategoriesRepository,
} from "@/repositories/categories.repository";
import {
  SupabaseIngredientsRepository,
  type IngredientsRepository,
} from "@/repositories/ingredients.repository";
import {
  SupabaseProductImportRepository,
  type ProductImportRepository,
  type ProductImportUpsertInput,
} from "@/repositories/product-import.repository";
import {
  SupabaseProductsRepository,
  type ProductsRepository,
} from "@/repositories/products.repository";

export type ProductImportPreviewStatus = "valid" | "warning" | "error";

export type ProductImportPreviewRow = {
  rowNumber: number;
  productName: string;
  slug: string;
  category: string;
  action: "create" | "update";
  status: ProductImportPreviewStatus;
  messages: string[];
};

export type ProductImportPreviewSummary = {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
};

export type ProductImportPreview = {
  rows: ProductImportPreviewRow[];
  summary: ProductImportPreviewSummary;
};

export type ProductImportExecutionRow = {
  rowNumber: number;
  productName: string;
  slug: string;
  action: "created" | "updated" | "skipped";
  status: "imported" | "failed" | "skipped";
  messages: string[];
  productId: string | null;
};

export type ProductImportExecutionSummary = {
  totalRows: number;
  importedRows: number;
  failedRows: number;
  skippedRows: number;
};

export type ProductImportExecutionResult = {
  log: ProductImportLog;
  preview: ProductImportPreview;
  rows: ProductImportExecutionRow[];
  summary: ProductImportExecutionSummary;
};

type NormalizedProductImportRow = {
  rowNumber: number;
  productName: string;
  slug: string;
  category: string;
  categoryId: string;
  affiliateUrl: string | null;
  shortDescription: string | null;
  rating: number | null;
  image: string | null;
  productStatus: ContentStatus;
  ingredientNames: string[];
  ingredientIds: string[];
  ingredientSnapshot: ProductIngredient[];
  pros: string[];
  cons: string[];
  faq: FAQItem[];
  action: "create" | "update";
  warnings: string[];
};

type ProductImportValidationRow = {
  rowNumber: number;
  productName: string;
  slug: string;
  category: string;
  action: "create" | "update";
  previewStatus: ProductImportPreviewStatus;
  messages: string[];
  warnings: string[];
} & Partial<NormalizedProductImportRow>;

type ValidationContext = {
  categories: Category[];
  ingredients: Ingredient[];
  products: Product[];
};

export class ProductImportService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository = new SupabaseCategoriesRepository(),
    private readonly ingredientsRepository: IngredientsRepository = new SupabaseIngredientsRepository(),
    private readonly productsRepository: ProductsRepository = new SupabaseProductsRepository(),
    private readonly productImportRepository: ProductImportRepository = new SupabaseProductImportRepository(),
  ) {}

  async previewImport(rows: ParsedProductImportRow[]): Promise<ProductImportPreview> {
    const context = await this.loadValidationContext();
    const previewRows = this.buildPreviewRows(rows, context);

    return {
      rows: previewRows.map((row) => ({
        rowNumber: row.rowNumber,
        productName: row.productName,
        slug: row.slug,
        category: row.category,
        action: row.action,
        status: row.previewStatus,
        messages: row.messages.length ? row.messages : row.warnings,
      })),
      summary: this.buildPreviewSummary(previewRows),
    };
  }

  async importRows(
    filename: string,
    rows: ParsedProductImportRow[],
  ): Promise<ProductImportExecutionResult> {
    const context = await this.loadValidationContext();
    const previewRows = this.buildPreviewRows(rows, context);
    const preview = {
      rows: previewRows.map((row) => ({
        rowNumber: row.rowNumber,
        productName: row.productName,
        slug: row.slug,
        category: row.category,
        action: row.action,
        status: row.previewStatus,
        messages: row.messages.length ? row.messages : row.warnings,
      })),
      summary: this.buildPreviewSummary(previewRows),
    } satisfies ProductImportPreview;
    const importableRows = previewRows.filter(
      (row): row is ProductImportValidationRow & NormalizedProductImportRow =>
        row.previewStatus !== "error" &&
        typeof row.categoryId === "string" &&
        typeof row.productStatus === "string" &&
        Array.isArray(row.ingredientIds) &&
        Array.isArray(row.ingredientSnapshot) &&
        Array.isArray(row.pros) &&
        Array.isArray(row.cons) &&
        Array.isArray(row.faq),
    );
    const log = await this.productImportRepository.createImportLog({
      filename,
      total_rows: rows.length,
      imported_rows: 0,
      failed_rows: preview.summary.errorRows,
      status: rows.length ? "pending" : "completed",
    });
    const results: ProductImportExecutionRow[] = [];
    let importedRows = 0;
    let failedRows = preview.summary.errorRows;

    for (const row of previewRows) {
      if (row.previewStatus === "error") {
        results.push({
          rowNumber: row.rowNumber,
          productName: row.productName,
          slug: row.slug,
          action: "skipped",
          status: "skipped",
          messages: row.messages,
          productId: null,
        });
      }
    }

    for (const row of importableRows) {
      try {
        const productId = await this.productImportRepository.upsertProductImportRow(
          this.toImportPayload(row),
        );

        importedRows += 1;
        results.push({
          rowNumber: row.rowNumber,
          productName: row.productName,
          slug: row.slug,
          action: row.action === "update" ? "updated" : "created",
          status: "imported",
          messages: row.warnings.length ? row.warnings : ["Imported successfully."],
          productId,
        });
      } catch (error) {
        failedRows += 1;
        results.push({
          rowNumber: row.rowNumber,
          productName: row.productName,
          slug: row.slug,
          action: "skipped",
          status: "failed",
          messages: [
            error instanceof Error
              ? error.message
              : "Unable to import this row.",
          ],
          productId: null,
        });
      }
    }

    const updatedLog = await this.productImportRepository.updateImportLog(log.id, {
      imported_rows: importedRows,
      failed_rows: failedRows,
      status:
        failedRows === 0
          ? "completed"
          : importedRows > 0
            ? "completed_with_errors"
            : "failed",
    });

    return {
      log: updatedLog,
      preview,
      rows: results.sort((left, right) => left.rowNumber - right.rowNumber),
      summary: {
        totalRows: rows.length,
        importedRows,
        failedRows,
        skippedRows: results.filter((row) => row.status === "skipped").length,
      },
    };
  }

  private async loadValidationContext(): Promise<ValidationContext> {
    const [categories, ingredients, products] = await Promise.all([
      this.categoriesRepository.getAllCategories(),
      this.ingredientsRepository.getAllIngredients(),
      this.productsRepository.getAllProducts(),
    ]);

    return { categories, ingredients, products };
  }

  private buildPreviewRows(rows: ParsedProductImportRow[], context: ValidationContext) {
    const categoryLookup = this.createCategoryLookup(context.categories);
    const ingredientLookup = this.createIngredientLookup(context.ingredients);
    const productBySlug = new Map(context.products.map((product) => [product.slug, product]));
    const seenSlugs = new Set<string>();

    return rows.map((entry) =>
      this.validateRow(entry, {
        categoryLookup,
        ingredientLookup,
        productBySlug,
        seenSlugs,
      }),
    );
  }

  private buildPreviewSummary(
    rows: Array<{
      previewStatus: ProductImportPreviewStatus;
      warnings: string[];
    }>,
  ): ProductImportPreviewSummary {
    return {
      totalRows: rows.length,
      validRows: rows.filter((row) => row.previewStatus === "valid").length,
      warningRows: rows.filter((row) => row.previewStatus === "warning").length,
      errorRows: rows.filter((row) => row.previewStatus === "error").length,
    };
  }

  private validateRow(
    entry: ParsedProductImportRow,
    context: {
      categoryLookup: Map<string, Category>;
      ingredientLookup: Map<string, Ingredient>;
      productBySlug: Map<string, Product>;
      seenSlugs: Set<string>;
    },
  ): ProductImportValidationRow {
    const sourceRow = entry.row;
    const productName = sourceRow.product_name.trim();
    const slug = sourceRow.slug.trim().toLowerCase();
    const categoryName = sourceRow.category.trim();
    const messages: string[] = [];
    const warnings: string[] = [];

    if (!productName) {
      messages.push("product_name is required.");
    }

    if (!slug) {
      messages.push("slug is required.");
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      messages.push("slug must use lowercase letters, numbers, and hyphens only.");
    }

    if (!categoryName) {
      messages.push("category is required.");
    }

    const category = categoryName
      ? this.findLookupMatch(context.categoryLookup, categoryName)
      : null;

    if (categoryName && !category) {
      messages.push(`Category "${categoryName}" does not exist in the live categories table.`);
    }

    if (slug) {
      if (context.seenSlugs.has(slug)) {
        messages.push(`Duplicate slug "${slug}" appears more than once in this CSV.`);
      } else {
        context.seenSlugs.add(slug);
      }
    }

    const existingProduct = slug ? context.productBySlug.get(slug) : null;
    const action: "create" | "update" = existingProduct ? "update" : "create";

    if (existingProduct) {
      warnings.push(`Slug "${slug}" already exists and this row will update the current product.`);
    }

    const affiliateUrl = this.validateUrl(sourceRow.affiliate_url, "affiliate_url", messages);
    const image = this.validateUrl(sourceRow.featured_image, "featured_image", messages);
    const rating = this.validateRating(sourceRow.rating, messages);

    const ingredientNames = splitPipeValues(sourceRow.ingredients);
    const uniqueIngredientNames = [...new Set(ingredientNames)];

    if (ingredientNames.length !== uniqueIngredientNames.length) {
      warnings.push("Duplicate ingredient names were found in this row and will be deduplicated.");
    }

    const resolvedIngredients = uniqueIngredientNames
      .map((ingredientName) => {
        const ingredient = this.findLookupMatch(context.ingredientLookup, ingredientName);

        if (!ingredient) {
          messages.push(
            `Ingredient "${ingredientName}" does not exist in the approved ingredients table.`,
          );
        }

        return ingredient ?? null;
      })
      .filter(Boolean) as Ingredient[];

    const status = this.validateStatus(sourceRow.status, messages);
    const faq = parseImportFaq(sourceRow.faq).filter((item) => item.question.trim());

    const previewStatus: ProductImportPreviewStatus = messages.length
      ? "error"
      : warnings.length
        ? "warning"
        : "valid";
    const result: ProductImportValidationRow = {
      rowNumber: entry.rowNumber,
      productName,
      slug,
      category: categoryName,
      action,
      previewStatus,
      messages,
      warnings,
      categoryId: category?.id ?? "",
      affiliateUrl,
      shortDescription: sourceRow.short_description.trim() || null,
      rating,
      image,
      productStatus: status,
      ingredientNames: uniqueIngredientNames,
      ingredientIds: resolvedIngredients.map((ingredient) => ingredient.id),
      ingredientSnapshot: this.buildIngredientSnapshot(resolvedIngredients),
      pros: splitPipeValues(sourceRow.pros),
      cons: splitPipeValues(sourceRow.cons),
      faq,
    };

    if (result.previewStatus === "error") {
      return result;
    }

    return {
      ...result,
      categoryId: category!.id,
      productStatus: status,
    };
  }

  private toImportPayload(row: NormalizedProductImportRow): ProductImportUpsertInput {
    return {
      title: row.productName,
      slug: row.slug,
      category_id: row.categoryId,
      affiliate_url: row.affiliateUrl,
      short_description: row.shortDescription,
      rating: row.rating,
      image: row.image,
      status: row.productStatus,
      pros: row.pros,
      cons: row.cons,
      faq: row.faq,
      ingredient_snapshot: row.ingredientSnapshot,
      ingredient_ids: row.ingredientIds,
    };
  }

  private createCategoryLookup(categories: Category[]) {
    const lookup = new Map<string, Category>();

    categories.forEach((category) => {
      [
        category.title,
        category.name,
        category.slug,
        this.slugify(category.title),
      ]
        .map((value) => this.createLookupKey(value))
        .forEach((key) => {
          if (key) {
            lookup.set(key, category);
          }
        });
    });

    return lookup;
  }

  private createIngredientLookup(ingredients: Ingredient[]) {
    const lookup = new Map<string, Ingredient>();

    ingredients.forEach((ingredient) => {
      [
        ingredient.name,
        ingredient.slug,
        ingredient.scientific_name ?? "",
        this.slugify(ingredient.name),
      ]
        .map((value) => this.createLookupKey(value))
        .forEach((key) => {
          if (key && !lookup.has(key)) {
            lookup.set(key, ingredient);
          }
        });
    });

    return lookup;
  }

  private buildIngredientSnapshot(ingredients: Ingredient[]): ProductIngredient[] {
    return ingredients.map((ingredient) => ({
      name: ingredient.name,
      description:
        ingredient.short_description ||
        ingredient.best_for ||
        ingredient.ingredient_category ||
        "Live ingredient record linked from the Suppriva library.",
      amount: ingredient.typical_dose || undefined,
      image: ingredient.image_url || ingredient.featured_image || undefined,
    }));
  }

  private validateUrl(value: string, fieldName: string, messages: string[]) {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return null;
    }

    try {
      const parsedUrl = new URL(normalizedValue);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error();
      }

      return normalizedValue;
    } catch {
      messages.push(`${fieldName} must be a valid http or https URL.`);
      return null;
    }
  }

  private validateRating(value: string, messages: string[]) {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return null;
    }

    const rating = Number(normalizedValue);

    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      messages.push("rating must be a number between 0 and 5.");
      return null;
    }

    return rating;
  }

  private validateStatus(value: string, messages: string[]) {
    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue) {
      return ContentStatus.Draft;
    }

    if (
      normalizedValue !== ContentStatus.Draft &&
      normalizedValue !== ContentStatus.Published &&
      normalizedValue !== ContentStatus.Archived
    ) {
      messages.push("status must be draft, published, or archived.");
      return ContentStatus.Draft;
    }

    return normalizeImportStatus(normalizedValue);
  }

  private createLookupKey(value: string) {
    return value.trim().toLowerCase();
  }

  private findLookupMatch<T>(lookup: Map<string, T>, value: string) {
    const normalizedValue = this.createLookupKey(value);

    return lookup.get(normalizedValue) ?? lookup.get(this.slugify(value));
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
