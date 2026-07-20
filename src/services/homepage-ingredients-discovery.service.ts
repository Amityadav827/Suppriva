import {
  DEFAULT_HOMEPAGE_INGREDIENTS_DISCOVERY,
  mergeHomepageIngredientsDiscoveryCms,
  type HomepageIngredientsDiscoveryCms,
} from "@/lib/homepage-ingredients-discovery";
import { ValidationError } from "@/lib/errors/ValidationError";
import { validateHomepageIngredientsDiscoveryInput } from "@/lib/validators/homepage-ingredients-discovery.validator";
import {
  SupabaseHomepageIngredientsDiscoveryRepository,
  type HomepageIngredientsDiscoveryRepository,
} from "@/repositories/homepage-ingredients-discovery.repository";

export class HomepageIngredientsDiscoveryService {
  constructor(
    private readonly homepageIngredientsDiscoveryRepository: HomepageIngredientsDiscoveryRepository =
      new SupabaseHomepageIngredientsDiscoveryRepository(),
  ) {}

  async getHomepageIngredientsDiscovery() {
    const ingredientsDiscovery =
      await this.homepageIngredientsDiscoveryRepository.getHomepageIngredientsDiscovery();

    return mergeHomepageIngredientsDiscoveryCms(ingredientsDiscovery);
  }

  async safeGetHomepageIngredientsDiscovery() {
    try {
      return await this.getHomepageIngredientsDiscovery();
    } catch {
      return DEFAULT_HOMEPAGE_INGREDIENTS_DISCOVERY;
    }
  }

  async updateHomepageIngredientsDiscovery(input: HomepageIngredientsDiscoveryCms) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateHomepageIngredientsDiscoveryInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const ingredientsDiscovery =
      await this.homepageIngredientsDiscoveryRepository.updateHomepageIngredientsDiscovery(
        normalizedInput,
      );

    return mergeHomepageIngredientsDiscoveryCms(ingredientsDiscovery);
  }

  private normalizeInput(
    input: HomepageIngredientsDiscoveryCms,
  ): HomepageIngredientsDiscoveryCms {
    return {
      chips: input.chips.map((chip, index) => ({
        ...chip,
        label: chip.label.trim(),
        icon: chip.icon.trim(),
        url: chip.url.trim(),
        sort_order: Number.isInteger(chip.sort_order) ? chip.sort_order : index,
        is_visible: Boolean(chip.is_visible),
      })),
    };
  }
}
