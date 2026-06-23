import { ContentStatus } from "@/lib/database/constants";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import type { Ingredient, ProductIngredient } from "@/lib/database/types";
import {
  type ProductCreateInput,
  type ProductUpdateInput,
  validateProductInput,
} from "@/lib/validators/product.validator";
import {
  SupabaseIngredientsRepository,
  type IngredientsRepository,
} from "@/repositories/ingredients.repository";
import {
  SupabaseProductsRepository,
  type ProductsRepository,
} from "@/repositories/products.repository";
import { AuthorsService, ReviewersService } from "@/services/expert-profiles.service";

export class ProductService {
  private readonly authorsService = new AuthorsService();
  private readonly reviewersService = new ReviewersService();

  constructor(
    private readonly productsRepository: ProductsRepository = new SupabaseProductsRepository(),
    private readonly ingredientsRepository: IngredientsRepository = new SupabaseIngredientsRepository(),
  ) {}

  get repository() {
    return this.productsRepository;
  }

  async getAllProducts() {
    return this.productsRepository.getAllProducts();
  }

  async getProductById(id: string) {
    const product = await this.productsRepository.getProductById(id);

    if (!product) {
      throw new AppError("Product not found.", "PRODUCT_NOT_FOUND", 404);
    }

    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await this.productsRepository.getProductBySlug(slug);

    if (!product) {
      throw new AppError("Product not found.", "PRODUCT_NOT_FOUND", 404);
    }

    return product;
  }

  async createProduct(input: ProductCreateInput) {
    const normalizedInput = await this.normalizeCreateInput(input);
    this.assertValid(normalizedInput, "create");
    await this.assertUniqueSlug(normalizedInput.slug);
    const selectedIngredients = await this.validateAndResolveIngredientIds(
      normalizedInput.ingredient_ids ?? [],
    );
    const productPayload = this.withIngredientSnapshot(normalizedInput, selectedIngredients);
    const product = await this.productsRepository.createProduct(productPayload);

    try {
      await this.productsRepository.syncProductIngredients(
        product.id,
        normalizedInput.ingredient_ids ?? [],
      );
    } catch (error) {
      await this.productsRepository.deleteProductIngredients(product.id);
      await this.productsRepository.deleteProduct(product.id);
      throw error;
    }

    return {
      ...product,
      ingredient_ids: normalizedInput.ingredient_ids ?? [],
    };
  }

  async updateProduct(id: string, input: ProductUpdateInput) {
    const existingProduct = await this.getProductById(id);
    const normalizedInput = await this.normalizeUpdateInput(input);
    this.assertValid(normalizedInput, "update");

    if (normalizedInput.slug) {
      await this.assertUniqueSlug(normalizedInput.slug, id);
    }

    const ingredientIds =
      "ingredient_ids" in normalizedInput
        ? normalizedInput.ingredient_ids ?? []
        : existingProduct.ingredient_ids ?? [];
    const selectedIngredients =
      "ingredient_ids" in normalizedInput
        ? await this.validateAndResolveIngredientIds(ingredientIds)
        : [];
    const updatePayload =
      "ingredient_ids" in normalizedInput
        ? this.withIngredientSnapshot(normalizedInput, selectedIngredients)
        : normalizedInput;
    const product = await this.productsRepository.updateProduct(id, updatePayload);

    if ("ingredient_ids" in normalizedInput) {
      await this.productsRepository.syncProductIngredients(id, ingredientIds);
    }

    return {
      ...product,
      ingredient_ids: ingredientIds,
    };
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);
    await this.productsRepository.deleteProductIngredients(id);
    await this.productsRepository.deleteProduct(id);
  }

  private async normalizeCreateInput(input: ProductCreateInput): Promise<ProductCreateInput> {
    const title = input.title.trim();
    const slug = input.slug?.trim() || this.createSlug(title);

    return {
      ...input,
      title,
      slug,
      category_id: input.category_id || null,
      author_id: await this.authorsService.resolveAssignedProfileId(input.author_id),
      reviewer_id: await this.reviewersService.resolveAssignedProfileId(input.reviewer_id),
      ingredient_ids: this.normalizeIngredientIds(input.ingredient_ids),
      gallery: input.gallery ?? [],
      ingredients: input.ingredients ?? [],
      benefits: input.benefits ?? [],
      pros: input.pros ?? [],
      cons: input.cons ?? [],
      faq: input.faq ?? [],
      status: input.status ?? ContentStatus.Draft,
      published_at:
        input.status === ContentStatus.Published
          ? input.published_at ?? new Date().toISOString()
          : input.published_at ?? null,
    };
  }

  private async normalizeUpdateInput(input: ProductUpdateInput): Promise<ProductUpdateInput> {
    const title = input.title?.trim();
    const slug = input.slug?.trim() || (title ? this.createSlug(title) : undefined);
    const normalizedInput: ProductUpdateInput = {
      ...input,
      ...(title ? { title } : {}),
      ...(slug ? { slug } : {}),
      published_at:
        input.status === ContentStatus.Published
          ? input.published_at ?? new Date().toISOString()
          : input.published_at,
    };

    if ("category_id" in input) {
      normalizedInput.category_id = input.category_id || null;
    }

    if ("author_id" in input) {
      normalizedInput.author_id = await this.authorsService.resolveAssignedProfileId(
        input.author_id,
      );
    }

    if ("reviewer_id" in input) {
      normalizedInput.reviewer_id = await this.reviewersService.resolveAssignedProfileId(
        input.reviewer_id,
      );
    }

    if ("ingredient_ids" in input) {
      normalizedInput.ingredient_ids = this.normalizeIngredientIds(input.ingredient_ids);
    }

    return normalizedInput;
  }

  private async assertUniqueSlug(slug: string | undefined, currentProductId?: string) {
    if (!slug) {
      throw new ValidationError("Product slug is required.");
    }

    const existingProduct = await this.productsRepository.getProductBySlug(slug);

    if (existingProduct && existingProduct.id !== currentProductId) {
      throw new ValidationError("A product with this slug already exists.");
    }
  }

  private assertValid(input: ProductCreateInput | ProductUpdateInput, mode: "create" | "update") {
    const result = validateProductInput(input, mode);

    if (!result.success) {
      throw new ValidationError(result.errors.join(" "));
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

  private normalizeIngredientIds(ingredientIds?: string[]) {
    if (!ingredientIds?.length) {
      return [];
    }

    return [...new Set(ingredientIds.map((value) => value.trim()).filter(Boolean))];
  }

  private async validateAndResolveIngredientIds(ingredientIds: string[]) {
    if (!ingredientIds.length) {
      return [];
    }

    const ingredients = await Promise.all(
      ingredientIds.map((ingredientId) => this.ingredientsRepository.getIngredientById(ingredientId)),
    );

    if (ingredients.some((ingredient) => !ingredient)) {
      throw new ValidationError("One or more selected ingredients are invalid.");
    }

    return ingredients as Ingredient[];
  }

  private withIngredientSnapshot<T extends ProductCreateInput | ProductUpdateInput>(
    input: T,
    ingredients: Ingredient[],
  ): T {
    return {
      ...input,
      ingredients: this.buildIngredientSnapshot(ingredients),
    };
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
}
