import {
  DEFAULT_HOMEPAGE_WELLNESS_EXPERT,
  mergeHomepageWellnessExpertCms,
  type HomepageWellnessExpertCms,
} from "@/lib/homepage-wellness-expert";
import { ValidationError } from "@/lib/errors/ValidationError";
import { validateHomepageWellnessExpertInput } from "@/lib/validators/homepage-wellness-expert.validator";
import {
  SupabaseHomepageWellnessExpertRepository,
  type HomepageWellnessExpertRepository,
} from "@/repositories/homepage-wellness-expert.repository";

export class HomepageWellnessExpertService {
  constructor(
    private readonly homepageWellnessExpertRepository: HomepageWellnessExpertRepository =
      new SupabaseHomepageWellnessExpertRepository(),
  ) {}

  async getHomepageWellnessExpert() {
    const wellnessExpert =
      await this.homepageWellnessExpertRepository.getHomepageWellnessExpert();

    return mergeHomepageWellnessExpertCms(wellnessExpert);
  }

  async safeGetHomepageWellnessExpert() {
    try {
      return await this.getHomepageWellnessExpert();
    } catch {
      return DEFAULT_HOMEPAGE_WELLNESS_EXPERT;
    }
  }

  async updateHomepageWellnessExpert(input: HomepageWellnessExpertCms) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateHomepageWellnessExpertInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const wellnessExpert =
      await this.homepageWellnessExpertRepository.updateHomepageWellnessExpert(
        normalizedInput,
      );

    return mergeHomepageWellnessExpertCms(wellnessExpert);
  }

  private normalizeInput(input: HomepageWellnessExpertCms): HomepageWellnessExpertCms {
    return {
      settings: {
        ...input.settings,
        badge_text: input.settings.badge_text.trim(),
        badge_icon: input.settings.badge_icon.trim(),
        fallback_name: input.settings.fallback_name.trim(),
        fallback_designation: input.settings.fallback_designation.trim(),
        fallback_bio: input.settings.fallback_bio.trim(),
        fallback_secondary_bio: input.settings.fallback_secondary_bio.trim(),
        fallback_image: input.settings.fallback_image.trim(),
        trust_line: input.settings.trust_line.trim(),
      },
    };
  }
}
