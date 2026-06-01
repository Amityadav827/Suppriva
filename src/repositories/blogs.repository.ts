import type { Blog } from "@/lib/database/types";
import { ContentStatus } from "@/lib/database/constants";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BlogCreateInput, BlogUpdateInput } from "@/lib/validators/blog.validator";
import type { SlugRepository } from "./base.repository";

export interface BlogsRepository extends SlugRepository<Blog> {
  getAllBlogs(): Promise<Blog[]>;
  getBlogById(id: string): Promise<Blog | null>;
  getBlogBySlug(slug: string): Promise<Blog | null>;
  createBlog(input: BlogCreateInput): Promise<Blog>;
  updateBlog(id: string, input: BlogUpdateInput): Promise<Blog>;
  deleteBlog(id: string): Promise<void>;
}

export class SupabaseBlogsRepository implements BlogsRepository {
  async getAllBlogs(): Promise<Blog[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Blog[];
  }

  async getBlogById(id: string): Promise<Blog | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as Blog | null) ?? null;
  }

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as Blog | null) ?? null;
  }

  async createBlog(input: BlogCreateInput): Promise<Blog> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("blogs")
      .insert(this.toDatabaseInput(input))
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as Blog;
  }

  async updateBlog(id: string, input: BlogUpdateInput): Promise<Blog> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("blogs")
      .update(this.toDatabaseInput(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as Blog;
  }

  async deleteBlog(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("blogs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  getAll(): Promise<Blog[]> {
    return this.getAllBlogs();
  }

  getById(id: string): Promise<Blog | null> {
    return this.getBlogById(id);
  }

  getBySlug(slug: string): Promise<Blog | null> {
    return this.getBlogBySlug(slug);
  }

  create(input: BlogCreateInput): Promise<Blog> {
    return this.createBlog(input);
  }

  update(id: string, input: BlogUpdateInput): Promise<Blog> {
    return this.updateBlog(id, input);
  }

  delete(id: string): Promise<void> {
    return this.deleteBlog(id);
  }

  private toDatabaseInput(input: BlogCreateInput | BlogUpdateInput) {
    const payload: Record<string, unknown> = {};

    if ("title" in input) payload.title = input.title;
    if ("slug" in input) payload.slug = input.slug;
    if ("excerpt" in input) payload.excerpt = input.excerpt ?? null;
    if ("content" in input) payload.content = input.content ?? {};
    if ("featured_image" in input) payload.featured_image = input.featured_image ?? null;
    if ("category_id" in input) payload.category_id = input.category_id ?? null;
    if ("author_id" in input) payload.author_id = input.author_id ?? null;
    if ("reading_time" in input) payload.reading_time = input.reading_time ?? null;
    if ("tags" in input) payload.tags = input.tags ?? [];
    if ("status" in input) payload.status = input.status ?? ContentStatus.Draft;
    if ("published_at" in input) payload.published_at = input.published_at ?? null;
    if ("seo_title" in input) payload.seo_title = input.seo_title ?? null;
    if ("seo_description" in input) payload.seo_description = input.seo_description ?? null;
    if ("seo_keywords" in input && input.seo_keywords?.length) {
      payload.seo_keywords = input.seo_keywords;
    }

    return payload;
  }
}
