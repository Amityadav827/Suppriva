import type {
  HomepageWellnessExpertCms,
  HomepageWellnessExpertSettings,
} from "@/lib/homepage-wellness-expert";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepageWellnessExpertRepository {
  getHomepageWellnessExpert(): Promise<Partial<HomepageWellnessExpertCms>>;
  updateHomepageWellnessExpert(
    input: HomepageWellnessExpertCms,
  ): Promise<Partial<HomepageWellnessExpertCms>>;
}

export class SupabaseHomepageWellnessExpertRepository
  implements HomepageWellnessExpertRepository
{
  async getHomepageWellnessExpert() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("homepage_wellness_expert_settings")
      .select("*")
      .eq("id", "home")
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return {
      settings: data as HomepageWellnessExpertSettings | undefined,
    };
  }

  async updateHomepageWellnessExpert(input: HomepageWellnessExpertCms) {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("homepage_wellness_expert_settings")
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

    return this.getHomepageWellnessExpert();
  }

  private toSettingsInput(settings: HomepageWellnessExpertSettings) {
    return {
      badge_text: settings.badge_text.trim(),
      badge_icon: settings.badge_icon.trim(),
      fallback_name: settings.fallback_name.trim(),
      fallback_designation: settings.fallback_designation.trim(),
      fallback_bio: settings.fallback_bio.trim(),
      fallback_secondary_bio: settings.fallback_secondary_bio.trim(),
      fallback_image: settings.fallback_image.trim(),
      trust_line: settings.trust_line.trim(),
    };
  }
}
