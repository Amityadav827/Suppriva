import {
  DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS,
  mergeHomepageWellnessSolutionsCms,
  type HomepageWellnessSolutionsCms,
} from "@/lib/homepage-wellness-solutions";
import { ValidationError } from "@/lib/errors/ValidationError";
import { validateHomepageWellnessSolutionsInput } from "@/lib/validators/homepage-wellness-solutions.validator";
import {
  SupabaseHomepageWellnessSolutionsRepository,
  type HomepageWellnessSolutionsRepository,
} from "@/repositories/homepage-wellness-solutions.repository";

export class HomepageWellnessSolutionsService {
  constructor(
    private readonly homepageWellnessSolutionsRepository: HomepageWellnessSolutionsRepository =
      new SupabaseHomepageWellnessSolutionsRepository(),
  ) {}

  async getHomepageWellnessSolutions() {
    const wellnessSolutions =
      await this.homepageWellnessSolutionsRepository.getHomepageWellnessSolutions();

    return mergeHomepageWellnessSolutionsCms(wellnessSolutions);
  }

  async safeGetHomepageWellnessSolutions() {
    try {
      return await this.getHomepageWellnessSolutions();
    } catch {
      return DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS;
    }
  }

  async updateHomepageWellnessSolutions(input: HomepageWellnessSolutionsCms) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateHomepageWellnessSolutionsInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const wellnessSolutions =
      await this.homepageWellnessSolutionsRepository.updateHomepageWellnessSolutions(
        normalizedInput,
      );

    return mergeHomepageWellnessSolutionsCms(wellnessSolutions);
  }

  private normalizeInput(
    input: HomepageWellnessSolutionsCms,
  ): HomepageWellnessSolutionsCms {
    return {
      settings: {
        ...input.settings,
        left_badge: input.settings.left_badge.trim(),
        left_heading: input.settings.left_heading.trim(),
        left_description: input.settings.left_description.trim(),
        left_cta_label: input.settings.left_cta_label.trim(),
        left_cta_url: input.settings.left_cta_url.trim(),
      },
      feature_cards: input.feature_cards.map((card, index) => ({
        ...card,
        icon: card.icon.trim(),
        title: card.title.trim(),
        description: card.description.trim(),
        sort_order: Number.isInteger(card.sort_order) ? card.sort_order : index,
        is_visible: Boolean(card.is_visible),
      })),
      showcase_products: input.showcase_products.map((product, index) => ({
        ...product,
        product_name: product.product_name.trim(),
        label: product.label.trim(),
        url: product.url.trim(),
        sort_order: Number.isInteger(product.sort_order) ? product.sort_order : index,
        is_visible: Boolean(product.is_visible),
      })),
    };
  }
}
