import {
  DEFAULT_HOMEPAGE_POPULAR_PICKS,
  mergeHomepagePopularPicksCms,
  type HomepagePopularPicksCms,
} from "@/lib/homepage-popular-picks";
import { ValidationError } from "@/lib/errors/ValidationError";
import { validateHomepagePopularPicksInput } from "@/lib/validators/homepage-popular-picks.validator";
import {
  SupabaseHomepagePopularPicksRepository,
  type HomepagePopularPicksRepository,
} from "@/repositories/homepage-popular-picks.repository";

export class HomepagePopularPicksService {
  constructor(
    private readonly homepagePopularPicksRepository: HomepagePopularPicksRepository =
      new SupabaseHomepagePopularPicksRepository(),
  ) {}

  async getHomepagePopularPicks() {
    const popularPicks =
      await this.homepagePopularPicksRepository.getHomepagePopularPicks();

    return mergeHomepagePopularPicksCms(popularPicks);
  }

  async safeGetHomepagePopularPicks() {
    try {
      return await this.getHomepagePopularPicks();
    } catch {
      return DEFAULT_HOMEPAGE_POPULAR_PICKS;
    }
  }

  async updateHomepagePopularPicks(input: HomepagePopularPicksCms) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateHomepagePopularPicksInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const popularPicks =
      await this.homepagePopularPicksRepository.updateHomepagePopularPicks(
        normalizedInput,
      );

    return mergeHomepagePopularPicksCms(popularPicks);
  }

  private normalizeInput(input: HomepagePopularPicksCms): HomepagePopularPicksCms {
    return {
      settings: {
        ...input.settings,
        max_products: Math.floor(Number(input.settings.max_products)),
        sort_mode: input.settings.sort_mode,
        source_mode: input.settings.source_mode,
        show_product_rating: Boolean(input.settings.show_product_rating),
        show_product_category: Boolean(input.settings.show_product_category),
        show_product_cta: Boolean(input.settings.show_product_cta),
      },
    };
  }
}
