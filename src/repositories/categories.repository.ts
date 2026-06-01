import type { Category } from "@/lib/database/types";
import { ContentStatus } from "@/lib/database/constants";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
} from "@/lib/validators/category.validator";
import type { SlugRepository } from "./base.repository";

export interface CategoriesRepository extends SlugRepository<Category> {
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(input: CategoryCreateInput): Promise<Category>;
  updateCategory(id: string, input: CategoryUpdateInput): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}

export class SupabaseCategoriesRepository implements CategoriesRepository {
  async getAllCategories(): Promise<Category[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Category[];
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as Category | null) ?? null;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as Category | null) ?? null;
  }

  async createCategory(input: CategoryCreateInput): Promise<Category> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .insert(this.toDatabaseInput(input))
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as Category;
  }

  async updateCategory(id: string, input: CategoryUpdateInput): Promise<Category> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .update(this.toDatabaseInput(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as Category;
  }

  async deleteCategory(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("categories")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  getAll(): Promise<Category[]> {
    return this.getAllCategories();
  }

  getById(id: string): Promise<Category | null> {
    return this.getCategoryById(id);
  }

  getBySlug(slug: string): Promise<Category | null> {
    return this.getCategoryBySlug(slug);
  }

  create(input: CategoryCreateInput): Promise<Category> {
    return this.createCategory(input);
  }

  update(id: string, input: CategoryUpdateInput): Promise<Category> {
    return this.updateCategory(id, input);
  }

  delete(id: string): Promise<void> {
    return this.deleteCategory(id);
  }

  private toDatabaseInput(input: CategoryCreateInput | CategoryUpdateInput) {
    const payload: Record<string, unknown> = {};

    if ("title" in input) {
      payload.title = input.title;
      payload.name = input.title;
    }
    if ("slug" in input) payload.slug = input.slug;
    if ("description" in input) payload.description = input.description ?? null;
    if ("image" in input) payload.image = input.image ?? null;
    if ("status" in input) payload.status = input.status ?? ContentStatus.Draft;
    if ("seo_title" in input) payload.seo_title = input.seo_title ?? null;
    if ("seo_description" in input) {
      payload.seo_description = input.seo_description ?? null;
    }
    if ("seo_keywords" in input) payload.seo_keywords = input.seo_keywords ?? [];

    return payload;
  }
}
