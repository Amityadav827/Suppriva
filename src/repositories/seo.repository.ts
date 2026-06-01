import type { SEO } from "@/lib/database/types";
import type { PageType } from "@/lib/database/constants";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SeoCreateInput, SeoUpdateInput } from "@/lib/validators/seo.validator";

export interface SeoRepository {
  getAllSeo(): Promise<SEO[]>;
  getSeoById(id: string): Promise<SEO | null>;
  getSeoByPage(pageType: PageType, pageSlug: string): Promise<SEO | null>;
  createSeo(input: SeoCreateInput): Promise<SEO>;
  updateSeo(id: string, input: SeoUpdateInput): Promise<SEO>;
  deleteSeo(id: string): Promise<void>;
}

export class SupabaseSeoRepository implements SeoRepository {
  async getAllSeo(): Promise<SEO[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("seo")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as SEO[];
  }

  async getSeoById(id: string): Promise<SEO | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("seo")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as SEO | null) ?? null;
  }

  async getSeoByPage(pageType: PageType, pageSlug: string): Promise<SEO | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("seo")
      .select("*")
      .eq("page_type", pageType)
      .eq("page_slug", pageSlug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as SEO | null) ?? null;
  }

  async createSeo(input: SeoCreateInput): Promise<SEO> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("seo")
      .insert(this.toDatabaseInput(input))
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as SEO;
  }

  async updateSeo(id: string, input: SeoUpdateInput): Promise<SEO> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("seo")
      .update(this.toDatabaseInput(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as SEO;
  }

  async deleteSeo(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("seo")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  private toDatabaseInput(input: SeoCreateInput | SeoUpdateInput) {
    const payload: Record<string, unknown> = {};

    if ("page_type" in input) payload.page_type = input.page_type;
    if ("page_slug" in input) payload.page_slug = input.page_slug;
    if ("meta_title" in input) payload.meta_title = input.meta_title;
    if ("meta_description" in input) payload.meta_description = input.meta_description;
    if ("canonical_url" in input) payload.canonical_url = input.canonical_url ?? null;
    if ("schema_json" in input) payload.schema_json = input.schema_json ?? {};

    return payload;
  }
}
