import type {
  HomepageHeroCms,
  HomepageHeroFloatingPill,
  HomepageHeroSettings,
  HomepageHeroTrustCard,
} from "@/lib/homepage-hero";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepageHeroRepository {
  getHomepageHero(): Promise<Partial<HomepageHeroCms>>;
  updateHomepageHero(input: HomepageHeroCms): Promise<Partial<HomepageHeroCms>>;
}

export class SupabaseHomepageHeroRepository implements HomepageHeroRepository {
  async getHomepageHero() {
    const supabase = await createSupabaseServerClient();

    const [settingsResult, trustCardsResult, floatingPillsResult] = await Promise.all([
      supabase
        .from("homepage_hero_settings")
        .select("*")
        .eq("id", "home")
        .maybeSingle(),
      supabase
        .from("homepage_hero_trust_cards")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("homepage_hero_floating_pills")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

    if (settingsResult.error) {
      throw new DatabaseError(settingsResult.error.message);
    }

    if (trustCardsResult.error) {
      throw new DatabaseError(trustCardsResult.error.message);
    }

    if (floatingPillsResult.error) {
      throw new DatabaseError(floatingPillsResult.error.message);
    }

    return {
      settings: settingsResult.data as HomepageHeroSettings | undefined,
      trust_cards: (trustCardsResult.data ?? []) as HomepageHeroTrustCard[],
      floating_pills: (floatingPillsResult.data ?? []) as HomepageHeroFloatingPill[],
    };
  }

  async updateHomepageHero(input: HomepageHeroCms) {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    const { error: settingsError } = await supabase
      .from("homepage_hero_settings")
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

    const { error: trustDeleteError } = await supabase
      .from("homepage_hero_trust_cards")
      .delete()
      .gte("sort_order", 0);

    if (trustDeleteError) {
      throw new DatabaseError(trustDeleteError.message);
    }

    const { error: pillsDeleteError } = await supabase
      .from("homepage_hero_floating_pills")
      .delete()
      .gte("sort_order", 0);

    if (pillsDeleteError) {
      throw new DatabaseError(pillsDeleteError.message);
    }

    if (input.trust_cards.length) {
      const { error } = await supabase
        .from("homepage_hero_trust_cards")
        .insert(input.trust_cards.map((card) => this.toTrustCardInput(card, now)));

      if (error) {
        throw new DatabaseError(error.message);
      }
    }

    if (input.floating_pills.length) {
      const { error } = await supabase
        .from("homepage_hero_floating_pills")
        .insert(input.floating_pills.map((pill) => this.toFloatingPillInput(pill, now)));

      if (error) {
        throw new DatabaseError(error.message);
      }
    }

    return this.getHomepageHero();
  }

  private toSettingsInput(settings: HomepageHeroSettings) {
    return {
      badge_text: settings.badge_text.trim(),
      badge_icon: settings.badge_icon.trim(),
      heading: settings.heading.trim(),
      highlight_heading: settings.highlight_heading.trim(),
      description: settings.description.trim(),
      primary_cta_label: settings.primary_cta_label.trim(),
      primary_cta_url: settings.primary_cta_url.trim(),
      secondary_cta_label: settings.secondary_cta_label.trim(),
      secondary_cta_url: settings.secondary_cta_url.trim(),
      hero_image: settings.hero_image.trim(),
      hero_image_alt: settings.hero_image_alt.trim(),
    };
  }

  private toTrustCardInput(card: HomepageHeroTrustCard, now: string) {
    return {
      icon: card.icon.trim(),
      title: card.title.trim(),
      description: card.description.trim(),
      sort_order: card.sort_order,
      is_visible: card.is_visible,
      updated_at: now,
    };
  }

  private toFloatingPillInput(pill: HomepageHeroFloatingPill, now: string) {
    return {
      label: pill.label.trim(),
      icon: pill.icon.trim(),
      link: pill.link.trim(),
      sort_order: pill.sort_order,
      is_visible: pill.is_visible,
      updated_at: now,
    };
  }
}
