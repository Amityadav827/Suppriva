import { ContentStatus } from "@/lib/database/constants";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type CategoryCreateInput,
  type CategoryUpdateInput,
  validateCategoryInput,
} from "@/lib/validators/category.validator";
import {
  SupabaseCategoriesRepository,
  type CategoriesRepository,
} from "@/repositories/categories.repository";

export class CategoryService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository = new SupabaseCategoriesRepository(),
  ) {}

  get repository() {
    return this.categoriesRepository;
  }

  async getAllCategories() {
    return this.categoriesRepository.getAllCategories();
  }

  async getCategoryById(id: string) {
    const category = await this.categoriesRepository.getCategoryById(id);

    if (!category) {
      throw new AppError("Category not found.", "CATEGORY_NOT_FOUND", 404);
    }

    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.categoriesRepository.getCategoryBySlug(slug);

    if (!category) {
      throw new AppError("Category not found.", "CATEGORY_NOT_FOUND", 404);
    }

    return category;
  }

  async createCategory(input: CategoryCreateInput) {
    const normalizedInput = this.normalizeCreateInput(input);
    this.assertValid(normalizedInput, "create");
    await this.assertUniqueSlug(normalizedInput.slug);

    return this.categoriesRepository.createCategory(normalizedInput);
  }

  async updateCategory(id: string, input: CategoryUpdateInput) {
    await this.getCategoryById(id);
    const normalizedInput = this.normalizeUpdateInput(input);
    this.assertValid(normalizedInput, "update");

    if (normalizedInput.slug) {
      await this.assertUniqueSlug(normalizedInput.slug, id);
    }

    return this.categoriesRepository.updateCategory(id, normalizedInput);
  }

  async deleteCategory(id: string) {
    await this.getCategoryById(id);
    await this.categoriesRepository.deleteCategory(id);
  }

  private normalizeCreateInput(input: CategoryCreateInput): CategoryCreateInput {
    const title = input.title.trim();
    const slug = input.slug?.trim() || this.createSlug(title);

    return {
      ...input,
      title,
      slug,
      status: input.status ?? ContentStatus.Draft,
      seo_keywords: input.seo_keywords ?? [],
    };
  }

  private normalizeUpdateInput(input: CategoryUpdateInput): CategoryUpdateInput {
    const title = input.title?.trim();
    const slug = input.slug?.trim() || (title ? this.createSlug(title) : undefined);
    const normalizedInput: CategoryUpdateInput = {
      ...input,
      ...(title ? { title } : {}),
      ...(slug ? { slug } : {}),
    };

    if ("seo_keywords" in input) {
      normalizedInput.seo_keywords = input.seo_keywords ?? [];
    }

    return normalizedInput;
  }

  private async assertUniqueSlug(slug: string | undefined, currentCategoryId?: string) {
    if (!slug) {
      throw new ValidationError("Category slug is required.");
    }

    const existingCategory = await this.categoriesRepository.getCategoryBySlug(slug);

    if (existingCategory && existingCategory.id !== currentCategoryId) {
      throw new ValidationError("A category with this slug already exists.");
    }
  }

  private assertValid(input: CategoryCreateInput | CategoryUpdateInput, mode: "create" | "update") {
    const result = validateCategoryInput(input, mode);

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
