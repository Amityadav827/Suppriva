import type {
  HomepageNewsletterCms,
  HomepageNewsletterSettings,
  HomepageNewsletterTrustChip,
} from "@/lib/homepage-newsletter";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepageNewsletterRepository {
  getHomepageNewsletter(): Promise<Partial<HomepageNewsletterCms>>;
  updateHomepageNewsletter(
    input: HomepageNewsletterCms,
  ): Promise<Partial<HomepageNewsletterCms>>;
}

export class SupabaseHomepageNewsletterRepository
  implements HomepageNewsletterRepository
{
  async getHomepageNewsletter() {
    const supabase = await createSupabaseServerClient();
    const [settingsResult, trustChipsResult] = await Promise.all([
      supabase
        .from("homepage_newsletter_settings")
        .select("*")
        .eq("id", "home")
        .maybeSingle(),
      supabase
        .from("homepage_newsletter_trust_chips")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

    if (settingsResult.error) {
      throw new DatabaseError(settingsResult.error.message);
    }

    if (trustChipsResult.error) {
      throw new DatabaseError(trustChipsResult.error.message);
    }

    return {
      settings: settingsResult.data as HomepageNewsletterSettings | undefined,
      trust_chips:
        (trustChipsResult.data ?? []) as HomepageNewsletterTrustChip[],
    };
  }

  async updateHomepageNewsletter(input: HomepageNewsletterCms) {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    const { error: settingsError } = await supabase
      .from("homepage_newsletter_settings")
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

    const { error: deleteError } = await supabase
      .from("homepage_newsletter_trust_chips")
      .delete()
      .gte("sort_order", 0);

    if (deleteError) {
      throw new DatabaseError(deleteError.message);
    }

    if (input.trust_chips.length) {
      const { error } = await supabase
        .from("homepage_newsletter_trust_chips")
        .insert(
          input.trust_chips.map((chip) => this.toTrustChipInput(chip, now)),
        );

      if (error) {
        throw new DatabaseError(error.message);
      }
    }

    return this.getHomepageNewsletter();
  }

  private toSettingsInput(settings: HomepageNewsletterSettings) {
    return {
      badge_text: settings.badge_text.trim(),
      form_badge_text: settings.form_badge_text.trim(),
      form_heading: settings.form_heading.trim(),
      form_description: settings.form_description.trim(),
      email_label: settings.email_label.trim(),
      email_placeholder: settings.email_placeholder.trim(),
      button_label: settings.button_label.trim(),
      loading_text: settings.loading_text.trim(),
      privacy_text: settings.privacy_text.trim(),
      no_spam_text: settings.no_spam_text.trim(),
      success_message: settings.success_message.trim(),
      error_message: settings.error_message.trim(),
    };
  }

  private toTrustChipInput(chip: HomepageNewsletterTrustChip, now: string) {
    return {
      label: chip.label.trim(),
      sort_order: chip.sort_order,
      is_visible: chip.is_visible,
      updated_at: now,
    };
  }
}
