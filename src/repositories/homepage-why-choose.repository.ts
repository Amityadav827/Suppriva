import type {
  HomepageWhyChooseCard,
  HomepageWhyChooseCms,
} from "@/lib/homepage-why-choose";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepageWhyChooseRepository {
  getHomepageWhyChoose(): Promise<Partial<HomepageWhyChooseCms>>;
  updateHomepageWhyChoose(
    input: HomepageWhyChooseCms,
  ): Promise<Partial<HomepageWhyChooseCms>>;
}

export class SupabaseHomepageWhyChooseRepository
  implements HomepageWhyChooseRepository
{
  async getHomepageWhyChoose() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("homepage_why_choose_cards")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return {
      cards: (data ?? []) as HomepageWhyChooseCard[],
    };
  }

  async updateHomepageWhyChoose(input: HomepageWhyChooseCms) {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();
    const { error: deleteError } = await supabase
      .from("homepage_why_choose_cards")
      .delete()
      .gte("sort_order", 0);

    if (deleteError) {
      throw new DatabaseError(deleteError.message);
    }

    if (input.cards.length) {
      const { error } = await supabase
        .from("homepage_why_choose_cards")
        .insert(input.cards.map((card) => this.toCardInput(card, now)));

      if (error) {
        throw new DatabaseError(error.message);
      }
    }

    return this.getHomepageWhyChoose();
  }

  private toCardInput(card: HomepageWhyChooseCard, now: string) {
    return {
      icon: card.icon.trim(),
      title: card.title.trim(),
      description: card.description.trim(),
      sort_order: card.sort_order,
      is_visible: card.is_visible,
      updated_at: now,
    };
  }
}
