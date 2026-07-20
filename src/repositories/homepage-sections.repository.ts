import type { HomepageSection } from "@/lib/database/types";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import type { HomepageSectionInput } from "@/lib/validators/homepage-section.validator";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepageSectionsRepository {
  getAllHomepageSections(): Promise<HomepageSection[]>;
  upsertHomepageSections(input: HomepageSectionInput[]): Promise<HomepageSection[]>;
}

export class SupabaseHomepageSectionsRepository
  implements HomepageSectionsRepository
{
  async getAllHomepageSections(): Promise<HomepageSection[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as HomepageSection[];
  }

  async upsertHomepageSections(input: HomepageSectionInput[]) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .upsert(input.map((section) => this.toDatabaseInput(section)), {
        onConflict: "section_key",
      })
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as HomepageSection[];
  }

  private toDatabaseInput(input: HomepageSectionInput) {
    return {
      section_key: input.section_key,
      section_name: input.section_name?.trim() || input.section_key,
      is_visible: input.is_visible ?? true,
      sort_order: input.sort_order ?? 0,
      title: input.title?.trim() || null,
      subtitle: input.subtitle?.trim() || null,
      cta_label: input.cta_label?.trim() || null,
      cta_url: input.cta_url?.trim() || null,
      updated_at: new Date().toISOString(),
    };
  }
}
