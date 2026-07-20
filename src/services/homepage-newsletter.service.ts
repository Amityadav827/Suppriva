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
    return {
      settings: {
        ...input.settings,
        badge_text: input.settings.badge_text.trim(),
        email_placeholder: input.settings.email_placeholder.trim(),
        button_label: input.settings.button_label.trim(),
        success_message: input.settings.success_message.trim(),
        error_message: input.settings.error_message.trim(),
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
