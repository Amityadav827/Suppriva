import type {
  HomepageIngredientChip,
  HomepageIngredientsDiscoveryCms,
} from "@/lib/homepage-ingredients-discovery";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepageIngredientsDiscoveryRepository {
  getHomepageIngredientsDiscovery(): Promise<Partial<HomepageIngredientsDiscoveryCms>>;
  updateHomepageIngredientsDiscovery(
    input: HomepageIngredientsDiscoveryCms,
  ): Promise<Partial<HomepageIngredientsDiscoveryCms>>;
}

export class SupabaseHomepageIngredientsDiscoveryRepository
  implements HomepageIngredientsDiscoveryRepository
{
  async getHomepageIngredientsDiscovery() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("homepage_ingredient_chips")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return {
      chips: (data ?? []) as HomepageIngredientChip[],
    };
  }

  async updateHomepageIngredientsDiscovery(input: HomepageIngredientsDiscoveryCms) {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    const { error: deleteError } = await supabase
      .from("homepage_ingredient_chips")
      .delete()
      .gte("sort_order", 0);

    if (deleteError) {
      throw new DatabaseError(deleteError.message);
    }

    if (input.chips.length) {
      const { error } = await supabase
        .from("homepage_ingredient_chips")
        .insert(input.chips.map((chip) => this.toChipInput(chip, now)));

      if (error) {
        throw new DatabaseError(error.message);
      }
    }

    return this.getHomepageIngredientsDiscovery();
  }

  private toChipInput(chip: HomepageIngredientChip, now: string) {
    return {
      label: chip.label.trim(),
      icon: chip.icon.trim(),
      url: chip.url.trim(),
      sort_order: chip.sort_order,
      is_visible: chip.is_visible,
      updated_at: now,
    };
  }
}
