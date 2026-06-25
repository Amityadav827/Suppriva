import type { Expert } from "@/lib/database/types";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ExpertCreateInput,
  ExpertUpdateInput,
} from "@/lib/validators/expert.validator";
import type { SlugRepository } from "./base.repository";

export interface ExpertsRepository extends SlugRepository<Expert> {
  getAllExperts(): Promise<Expert[]>;
  getActiveExperts(): Promise<Expert[]>;
  getFeaturedExperts(): Promise<Expert[]>;
  getExpertById(id: string): Promise<Expert | null>;
  getExpertBySlug(slug: string): Promise<Expert | null>;
  createExpert(input: ExpertCreateInput): Promise<Expert>;
  updateExpert(id: string, input: ExpertUpdateInput): Promise<Expert>;
  deleteExpert(id: string): Promise<void>;
}

export class SupabaseExpertsRepository implements ExpertsRepository {
  async getAllExperts(): Promise<Expert[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Expert[];
  }

  async getActiveExperts(): Promise<Expert[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Expert[];
  }

  async getFeaturedExperts(): Promise<Expert[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .eq("status", "active")
      .eq("featured_on_homepage", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as Expert[];
  }

  async getExpertById(id: string): Promise<Expert | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("experts").select("*").eq("id", id).maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as Expert | null) ?? null;
  }

  async getExpertBySlug(slug: string): Promise<Expert | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as Expert | null) ?? null;
  }

  async createExpert(input: ExpertCreateInput): Promise<Expert> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("experts")
      .insert(this.toDatabaseInput(input))
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as Expert;
  }

  async updateExpert(id: string, input: ExpertUpdateInput): Promise<Expert> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("experts")
      .update(this.toDatabaseInput(input))
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as Expert;
  }

  async deleteExpert(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("experts").delete().eq("id", id);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  getAll(): Promise<Expert[]> {
    return this.getAllExperts();
  }

  getById(id: string): Promise<Expert | null> {
    return this.getExpertById(id);
  }

  getBySlug(slug: string): Promise<Expert | null> {
    return this.getExpertBySlug(slug);
  }

  create(input: ExpertCreateInput): Promise<Expert> {
    return this.createExpert(input);
  }

  update(id: string, input: ExpertUpdateInput): Promise<Expert> {
    return this.updateExpert(id, input);
  }

  delete(id: string): Promise<void> {
    return this.deleteExpert(id);
  }

  private toDatabaseInput(input: ExpertCreateInput | ExpertUpdateInput) {
    const payload: Record<string, unknown> = {};

    if ("name" in input) payload.name = input.name;
    if ("slug" in input) payload.slug = input.slug;
    if ("profile_image" in input) payload.profile_image = input.profile_image ?? null;
    if ("designation" in input) payload.designation = input.designation ?? null;
    if ("short_bio" in input) payload.short_bio = input.short_bio ?? null;
    if ("full_bio" in input) payload.full_bio = input.full_bio ?? null;
    if ("editorial_contribution" in input) {
      payload.editorial_contribution = input.editorial_contribution ?? null;
    }
    if ("content_reviewed" in input) payload.content_reviewed = input.content_reviewed ?? [];
    if ("experience_years" in input) payload.experience_years = input.experience_years ?? null;
    if ("linkedin_url" in input) payload.linkedin_url = input.linkedin_url ?? null;
    if ("website_url" in input) payload.website_url = input.website_url ?? null;
    if ("email" in input) payload.email = input.email ?? null;
    if ("expertise_tags" in input) payload.expertise_tags = input.expertise_tags ?? [];
    if ("status" in input) payload.status = input.status ?? "active";
    if ("display_order" in input) payload.display_order = input.display_order ?? 0;
    if ("featured_on_homepage" in input) {
      payload.featured_on_homepage = input.featured_on_homepage ?? false;
    }
    if ("seo_title" in input) payload.seo_title = input.seo_title ?? null;
    if ("seo_description" in input) payload.seo_description = input.seo_description ?? null;
    if ("meta_image" in input) payload.meta_image = input.meta_image ?? null;
    if ("linked_author_id" in input) payload.linked_author_id = input.linked_author_id ?? null;
    if ("linked_reviewer_id" in input) {
      payload.linked_reviewer_id = input.linked_reviewer_id ?? null;
    }

    return payload;
  }
}
