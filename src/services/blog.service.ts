import { ContentStatus } from "@/lib/database/constants";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type BlogCreateInput,
  type BlogUpdateInput,
  validateBlogInput,
} from "@/lib/validators/blog.validator";
import {
  SupabaseBlogsRepository,
  type BlogsRepository,
} from "@/repositories/blogs.repository";

export class BlogService {
  constructor(private readonly blogsRepository: BlogsRepository = new SupabaseBlogsRepository()) {}

  get repository() {
    return this.blogsRepository;
  }

  async getAllBlogs() {
    return this.blogsRepository.getAllBlogs();
  }

  async getBlogById(id: string) {
    const blog = await this.blogsRepository.getBlogById(id);

    if (!blog) {
      throw new AppError("Blog not found.", "BLOG_NOT_FOUND", 404);
    }

    return blog;
  }

  async getBlogBySlug(slug: string) {
    const blog = await this.blogsRepository.getBlogBySlug(slug);

    if (!blog) {
      throw new AppError("Blog not found.", "BLOG_NOT_FOUND", 404);
    }

    return blog;
  }

  async createBlog(input: BlogCreateInput) {
    const normalizedInput = this.normalizeCreateInput(input);
    this.assertValid(normalizedInput, "create");
    await this.assertUniqueSlug(normalizedInput.slug);

    return this.blogsRepository.createBlog(normalizedInput);
  }

  async updateBlog(id: string, input: BlogUpdateInput) {
    await this.getBlogById(id);
    const normalizedInput = this.normalizeUpdateInput(input);
    this.assertValid(normalizedInput, "update");

    if (normalizedInput.slug) {
      await this.assertUniqueSlug(normalizedInput.slug, id);
    }

    return this.blogsRepository.updateBlog(id, normalizedInput);
  }

  async deleteBlog(id: string) {
    await this.getBlogById(id);
    await this.blogsRepository.deleteBlog(id);
  }

  private normalizeCreateInput(input: BlogCreateInput): BlogCreateInput {
    const title = input.title.trim();
    const slug = input.slug?.trim() || this.createSlug(title);

    return {
      ...input,
      title,
      slug,
      category_id: input.category_id || null,
      author_id: input.author_id || null,
      content: input.content ?? {},
      tags: input.tags ?? [],
      status: input.status ?? ContentStatus.Draft,
      published_at:
        input.status === ContentStatus.Published
          ? input.published_at ?? new Date().toISOString()
          : input.published_at ?? null,
      seo_keywords: input.seo_keywords,
    };
  }

  private normalizeUpdateInput(input: BlogUpdateInput): BlogUpdateInput {
    const title = input.title?.trim();
    const slug = input.slug?.trim() || (title ? this.createSlug(title) : undefined);
    const normalizedInput: BlogUpdateInput = {
      ...input,
      ...(title ? { title } : {}),
      ...(slug ? { slug } : {}),
      published_at:
        input.status === ContentStatus.Published
          ? input.published_at ?? new Date().toISOString()
          : input.published_at,
    };

    if ("category_id" in input) normalizedInput.category_id = input.category_id || null;
    if ("author_id" in input) normalizedInput.author_id = input.author_id || null;
    if ("tags" in input) normalizedInput.tags = input.tags ?? [];
    if ("seo_keywords" in input) normalizedInput.seo_keywords = input.seo_keywords ?? [];

    return normalizedInput;
  }

  private async assertUniqueSlug(slug: string | undefined, currentBlogId?: string) {
    if (!slug) {
      throw new ValidationError("Blog slug is required.");
    }

    const existingBlog = await this.blogsRepository.getBlogBySlug(slug);

    if (existingBlog && existingBlog.id !== currentBlogId) {
      throw new ValidationError("A blog with this slug already exists.");
    }
  }

  private assertValid(input: BlogCreateInput | BlogUpdateInput, mode: "create" | "update") {
    const result = validateBlogInput(input, mode);

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
