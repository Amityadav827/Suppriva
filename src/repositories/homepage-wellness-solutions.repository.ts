import type {
  HomepageWellnessSolutionFeatureCard,
  HomepageWellnessSolutionsCms,
  HomepageWellnessSolutionsSettings,
  HomepageWellnessSolutionShowcaseProduct,
} from "@/lib/homepage-wellness-solutions";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepageWellnessSolutionsRepository {
  getHomepageWellnessSolutions(): Promise<Partial<HomepageWellnessSolutionsCms>>;
  updateHomepageWellnessSolutions(
    input: HomepageWellnessSolutionsCms,
  ): Promise<Partial<HomepageWellnessSolutionsCms>>;
}

export class SupabaseHomepageWellnessSolutionsRepository
  implements HomepageWellnessSolutionsRepository
{
  async getHomepageWellnessSolutions() {
    const supabase = await createSupabaseServerClient();
    const [settingsResult, featureCardsResult, showcaseProductsResult] =
      await Promise.all([
        supabase
          .from("homepage_wellness_solutions_settings")
          .select("*")
          .eq("id", "home")
          .maybeSingle(),
        supabase
          .from("homepage_wellness_solution_feature_cards")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("homepage_wellness_solution_showcase_products")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

    if (settingsResult.error) {
      throw new DatabaseError(settingsResult.error.message);
    }

    if (featureCardsResult.error) {
      throw new DatabaseError(featureCardsResult.error.message);
    }

    if (showcaseProductsResult.error) {
      throw new DatabaseError(showcaseProductsResult.error.message);
    }

    return {
      settings: settingsResult.data as
        | HomepageWellnessSolutionsSettings
        | undefined,
      feature_cards:
        (featureCardsResult.data ?? []) as HomepageWellnessSolutionFeatureCard[],
      showcase_products:
        (showcaseProductsResult.data ?? []) as HomepageWellnessSolutionShowcaseProduct[],
    };
  }

  async updateHomepageWellnessSolutions(input: HomepageWellnessSolutionsCms) {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    const { error: settingsError } = await supabase
      .from("homepage_wellness_solutions_settings")
      .upsert({
        id: "home",
        ...this.toSettingsInput(input.settings),
        updated_at: now,
      })
      .select("*")
      .single();

    if (settingsError) {
      throw new DatabaseError(settingsError.message);
    }

    const { error: featureDeleteError } = await supabase
      .from("homepage_wellness_solution_feature_cards")
      .delete()
      .gte("sort_order", 0);

    if (featureDeleteError) {
      throw new DatabaseError(featureDeleteError.message);
    }

    if (input.feature_cards.length) {
      const { error } = await supabase
        .from("homepage_wellness_solution_feature_cards")
        .insert(input.feature_cards.map((card) => this.toFeatureCardInput(card, now)));

      if (error) {
        throw new DatabaseError(error.message);
      }
    }

    const { error: showcaseDeleteError } = await supabase
      .from("homepage_wellness_solution_showcase_products")
      .delete()
      .gte("sort_order", 0);

    if (showcaseDeleteError) {
      throw new DatabaseError(showcaseDeleteError.message);
    }

    if (input.showcase_products.length) {
      const { error } = await supabase
        .from("homepage_wellness_solution_showcase_products")
        .insert(
          input.showcase_products.map((product) =>
            this.toShowcaseProductInput(product, now),
          ),
        );

      if (error) {
        throw new DatabaseError(error.message);
      }
    }

    return this.getHomepageWellnessSolutions();
  }

  private toSettingsInput(settings: HomepageWellnessSolutionsSettings) {
    return {
      left_badge: settings.left_badge.trim(),
      left_heading: settings.left_heading.trim(),
      left_description: settings.left_description.trim(),
      left_cta_label: settings.left_cta_label.trim(),
      left_cta_url: settings.left_cta_url.trim(),
    };
  }

  private toFeatureCardInput(
    card: HomepageWellnessSolutionFeatureCard,
    now: string,
  ) {
    return {
      icon: card.icon.trim(),
      title: card.title.trim(),
      description: card.description.trim(),
      sort_order: card.sort_order,
      is_visible: card.is_visible,
      updated_at: now,
    };
  }

  private toShowcaseProductInput(
    product: HomepageWellnessSolutionShowcaseProduct,
    now: string,
  ) {
    return {
      product_name: product.product_name.trim(),
      label: product.label.trim(),
      url: product.url.trim(),
      sort_order: product.sort_order,
      is_visible: product.is_visible,
      updated_at: now,
    };
  }
}
