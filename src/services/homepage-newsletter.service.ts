import {
  DEFAULT_HOMEPAGE_NEWSLETTER,
  mergeHomepageNewsletterCms,
  type HomepageNewsletterCms,
} from "@/lib/homepage-newsletter";
import { ValidationError } from "@/lib/errors/ValidationError";
import { validateHomepageNewsletterInput } from "@/lib/validators/homepage-newsletter.validator";
import {
  SupabaseHomepageNewsletterRepository,
  type HomepageNewsletterRepository,
} from "@/repositories/homepage-newsletter.repository";

export class HomepageNewsletterService {
  constructor(
    private readonly homepageNewsletterRepository: HomepageNewsletterRepository =
      new SupabaseHomepageNewsletterRepository(),
  ) {}

  async getHomepageNewsletter() {
    const newsletter =
      await this.homepageNewsletterRepository.getHomepageNewsletter();

    return mergeHomepageNewsletterCms(newsletter);
  }

  async safeGetHomepageNewsletter() {
    try {
      return await this.getHomepageNewsletter();
    } catch {
      return DEFAULT_HOMEPAGE_NEWSLETTER;
    }
  }

  async updateHomepageNewsletter(input: HomepageNewsletterCms) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateHomepageNewsletterInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const newsletter =
      await this.homepageNewsletterRepository.updateHomepageNewsletter(
        normalizedInput,
      );

    return mergeHomepageNewsletterCms(newsletter);
  }

  private normalizeInput(input: HomepageNewsletterCms): HomepageNewsletterCms {
    const settings = {
      ...DEFAULT_HOMEPAGE_NEWSLETTER.settings,
      ...input.settings,
    };

    return {
      settings: {
        ...settings,
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
      },
      trust_chips: input.trust_chips.map((chip, index) => ({
        ...chip,
        label: chip.label.trim(),
        sort_order: Number.isInteger(chip.sort_order) ? chip.sort_order : index,
        is_visible: Boolean(chip.is_visible),
      })),
    };
  }
}
