import type {
  HomepageTrustBadge,
  HomepageTrustBadgesCms,
} from "@/lib/homepage-trust-badges";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepageTrustBadgesRepository {
  getHomepageTrustBadges(): Promise<Partial<HomepageTrustBadgesCms>>;
  updateHomepageTrustBadges(
    input: HomepageTrustBadgesCms,
  ): Promise<Partial<HomepageTrustBadgesCms>>;
}

export class SupabaseHomepageTrustBadgesRepository
  implements HomepageTrustBadgesRepository
{
  async getHomepageTrustBadges() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("homepage_trust_badges")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return {
      badges: (data ?? []) as HomepageTrustBadge[],
    };
  }

  async updateHomepageTrustBadges(input: HomepageTrustBadgesCms) {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();
    const { error: deleteError } = await supabase
      .from("homepage_trust_badges")
      .delete()
      .gte("sort_order", 0);

    if (deleteError) {
      throw new DatabaseError(deleteError.message);
    }

    if (input.badges.length) {
      const { error } = await supabase
        .from("homepage_trust_badges")
        .insert(input.badges.map((badge) => this.toBadgeInput(badge, now)));

      if (error) {
        throw new DatabaseError(error.message);
      }
    }

    return this.getHomepageTrustBadges();
  }

  private toBadgeInput(badge: HomepageTrustBadge, now: string) {
    return {
      icon: badge.icon.trim(),
      title: badge.title.trim(),
      description: badge.description.trim(),
      sort_order: badge.sort_order,
      is_visible: badge.is_visible,
      updated_at: now,
    };
  }
}
