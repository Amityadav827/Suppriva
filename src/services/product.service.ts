import { ContentStatus } from "@/lib/database/constants";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type ProductCreateInput,
  type ProductUpdateInput,
  validateProductInput,
} from "@/lib/validators/product.validator";
import {
  SupabaseProductsRepository,
  type ProductsRepository,
} from "@/repositories/products.repository";

export class ProductService {
  constructor(
    private readonly productsRepository: ProductsRepository = new SupabaseProductsRepository(),
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
    const normalizedInput = this.normalizeCreateInput(input);
    this.assertValid(normalizedInput, "create");
    await this.assertUniqueSlug(normalizedInput.slug);

    return this.productsRepository.createProduct(normalizedInput);
  }

  async updateProduct(id: string, input: ProductUpdateInput) {
    await this.getProductById(id);
    const normalizedInput = this.normalizeUpdateInput(input);
    this.assertValid(normalizedInput, "update");

    if (normalizedInput.slug) {
      await this.assertUniqueSlug(normalizedInput.slug, id);
    }

    return this.productsRepository.updateProduct(id, normalizedInput);
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);
    await this.productsRepository.deleteProduct(id);
  }

  private normalizeCreateInput(input: ProductCreateInput): ProductCreateInput {
    const title = input.title.trim();
    const slug = input.slug?.trim() || this.createSlug(title);

    return {
      ...input,
      title,
      slug,
      category_id: input.category_id || null,
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

  private normalizeUpdateInput(input: ProductUpdateInput): ProductUpdateInput {
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
}
