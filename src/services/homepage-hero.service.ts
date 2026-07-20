import {
  DEFAULT_HOMEPAGE_HERO,
  mergeHomepageHeroCms,
  type HomepageHeroCms,
} from "@/lib/homepage-hero";
import { ValidationError } from "@/lib/errors/ValidationError";
import { validateHomepageHeroInput } from "@/lib/validators/homepage-hero.validator";
import {
  SupabaseHomepageHeroRepository,
  type HomepageHeroRepository,
} from "@/repositories/homepage-hero.repository";

export class HomepageHeroService {
  constructor(
    private readonly homepageHeroRepository: HomepageHeroRepository =
      new SupabaseHomepageHeroRepository(),
  ) {}

  async getHomepageHero() {
    const hero = await this.homepageHeroRepository.getHomepageHero();

    return mergeHomepageHeroCms(hero);
  }

  async safeGetHomepageHero() {
    try {
      return await this.getHomepageHero();
    } catch {
      return DEFAULT_HOMEPAGE_HERO;
    }
  }

  async updateHomepageHero(input: HomepageHeroCms) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateHomepageHeroInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const hero = await this.homepageHeroRepository.updateHomepageHero(normalizedInput);

    return mergeHomepageHeroCms(hero);
  }

  private normalizeInput(input: HomepageHeroCms): HomepageHeroCms {
    return {
      settings: {
        ...input.settings,
        badge_text: input.settings.badge_text.trim(),
        badge_icon: input.settings.badge_icon.trim(),
        heading: input.settings.heading.trim(),
        highlight_heading: input.settings.highlight_heading.trim(),
        description: input.settings.description.trim(),
        primary_cta_label: input.settings.primary_cta_label.trim(),
        primary_cta_url: input.settings.primary_cta_url.trim(),
        secondary_cta_label: input.settings.secondary_cta_label.trim(),
        secondary_cta_url: input.settings.secondary_cta_url.trim(),
        hero_image: input.settings.hero_image.trim(),
        hero_image_alt: input.settings.hero_image_alt.trim(),
      },
      trust_cards: input.trust_cards.map((card, index) => ({
        ...card,
        icon: card.icon.trim(),
        title: card.title.trim(),
        description: card.description.trim(),
        sort_order: Number.isInteger(card.sort_order) ? card.sort_order : index,
        is_visible: Boolean(card.is_visible),
      })),
      floating_pills: input.floating_pills.map((pill, index) => ({
        ...pill,
        label: pill.label.trim(),
        icon: pill.icon.trim(),
        link: pill.link.trim(),
        sort_order: Number.isInteger(pill.sort_order) ? pill.sort_order : index,
        is_visible: Boolean(pill.is_visible),
      })),
    };
  }
}
