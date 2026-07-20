import {
  DEFAULT_HOMEPAGE_TRUST_BADGES,
  mergeHomepageTrustBadgesCms,
  type HomepageTrustBadgesCms,
} from "@/lib/homepage-trust-badges";
import { ValidationError } from "@/lib/errors/ValidationError";
import { validateHomepageTrustBadgesInput } from "@/lib/validators/homepage-trust-badges.validator";
import {
  SupabaseHomepageTrustBadgesRepository,
  type HomepageTrustBadgesRepository,
} from "@/repositories/homepage-trust-badges.repository";

export class HomepageTrustBadgesService {
  constructor(
    private readonly homepageTrustBadgesRepository: HomepageTrustBadgesRepository =
      new SupabaseHomepageTrustBadgesRepository(),
  ) {}

  async getHomepageTrustBadges() {
    const trustBadges =
      await this.homepageTrustBadgesRepository.getHomepageTrustBadges();

    return mergeHomepageTrustBadgesCms(trustBadges);
  }

  async safeGetHomepageTrustBadges() {
    try {
      return await this.getHomepageTrustBadges();
    } catch {
      return DEFAULT_HOMEPAGE_TRUST_BADGES;
    }
  }

  async updateHomepageTrustBadges(input: HomepageTrustBadgesCms) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateHomepageTrustBadgesInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const trustBadges =
      await this.homepageTrustBadgesRepository.updateHomepageTrustBadges(
        normalizedInput,
      );

    return mergeHomepageTrustBadgesCms(trustBadges);
  }

  private normalizeInput(input: HomepageTrustBadgesCms): HomepageTrustBadgesCms {
    return {
      badges: input.badges.map((badge, index) => ({
        ...badge,
        icon: badge.icon.trim(),
        title: badge.title.trim(),
        description: badge.description.trim(),
        sort_order: Number.isInteger(badge.sort_order)
          ? badge.sort_order
          : index,
        is_visible: Boolean(badge.is_visible),
      })),
    };
  }
}
