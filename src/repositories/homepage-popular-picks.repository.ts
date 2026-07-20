import type {
  HomepagePopularPicksCms,
  HomepagePopularPicksSettings,
} from "@/lib/homepage-popular-picks";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepagePopularPicksRepository {
  getHomepagePopularPicks(): Promise<Partial<HomepagePopularPicksCms>>;
  updateHomepagePopularPicks(
    input: HomepagePopularPicksCms,
  ): Promise<Partial<HomepagePopularPicksCms>>;
}

export class SupabaseHomepagePopularPicksRepository
  implements HomepagePopularPicksRepository
{
  async getHomepagePopularPicks() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("homepage_popular_picks_settings")
      .select("*")
      .eq("id", "home")
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return {
      settings: data as HomepagePopularPicksSettings | undefined,
    };
  }

  async updateHomepagePopularPicks(input: HomepagePopularPicksCms) {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("homepage_popular_picks_settings")
      .upsert({
        id: "home",
        ...this.toSettingsInput(input.settings),
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return this.getHomepagePopularPicks();
  }

  private toSettingsInput(settings: HomepagePopularPicksSettings) {
    return {
      max_products: settings.max_products,
      sort_mode: settings.sort_mode,
      source_mode: settings.source_mode,
      show_product_rating: settings.show_product_rating,
      show_product_category: settings.show_product_category,
      show_product_cta: settings.show_product_cta,
    };
  }
}
