import {
  DEFAULT_HOMEPAGE_WHY_CHOOSE,
  mergeHomepageWhyChooseCms,
  type HomepageWhyChooseCms,
} from "@/lib/homepage-why-choose";
import { ValidationError } from "@/lib/errors/ValidationError";
import { validateHomepageWhyChooseInput } from "@/lib/validators/homepage-why-choose.validator";
import {
  SupabaseHomepageWhyChooseRepository,
  type HomepageWhyChooseRepository,
} from "@/repositories/homepage-why-choose.repository";

export class HomepageWhyChooseService {
  constructor(
    private readonly homepageWhyChooseRepository: HomepageWhyChooseRepository =
      new SupabaseHomepageWhyChooseRepository(),
  ) {}

  async getHomepageWhyChoose() {
    const whyChoose =
      await this.homepageWhyChooseRepository.getHomepageWhyChoose();

    return mergeHomepageWhyChooseCms(whyChoose);
  }

  async safeGetHomepageWhyChoose() {
    try {
      return await this.getHomepageWhyChoose();
    } catch {
      return DEFAULT_HOMEPAGE_WHY_CHOOSE;
    }
  }

  async updateHomepageWhyChoose(input: HomepageWhyChooseCms) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateHomepageWhyChooseInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const whyChoose =
      await this.homepageWhyChooseRepository.updateHomepageWhyChoose(
        normalizedInput,
      );

    return mergeHomepageWhyChooseCms(whyChoose);
  }

  private normalizeInput(input: HomepageWhyChooseCms): HomepageWhyChooseCms {
    return {
      cards: input.cards.map((card, index) => ({
        ...card,
        icon: card.icon.trim(),
        title: card.title.trim(),
        description: card.description.trim(),
        sort_order: Number.isInteger(card.sort_order) ? card.sort_order : index,
        is_visible: Boolean(card.is_visible),
      })),
    };
  }
}
