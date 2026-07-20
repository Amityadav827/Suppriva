type Timestamp = string;

export type HomepageHeroSettings = {
  id?: string;
  badge_text: string;
  badge_icon: string;
  heading: string;
  highlight_heading: string;
  description: string;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  hero_image: string;
  hero_image_alt: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageHeroTrustCard = {
  id?: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageHeroFloatingPill = {
  id?: string;
  label: string;
  icon: string;
  link: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageHeroCms = {
  settings: HomepageHeroSettings;
  trust_cards: HomepageHeroTrustCard[];
  floating_pills: HomepageHeroFloatingPill[];
};

export const DEFAULT_HOMEPAGE_HERO: HomepageHeroCms = {
  settings: {
    badge_text: "Wellness Discovery Platform",
    badge_icon: "check-circle-2",
    heading: "Discover Wellness Solutions",
    highlight_heading: "That Fit Your Goals",
    description:
      "Explore supplements, ingredient insights, and wellness collections designed to help you make informed health decisions with confidence.",
    primary_cta_label: "Explore Wellness Categories",
    primary_cta_url: "/category",
    secondary_cta_label: "Explore Ingredients",
    secondary_cta_url: "/ingredients",
    hero_image: "/assets/hero-supplements.webp",
    hero_image_alt: "Premium supplement bottles with green and gold packaging",
  },
  trust_cards: [
    {
      title: "Ingredient Library",
      description:
        "Explore vitamins, herbs, minerals, probiotics, and functional ingredients.",
      icon: "leaf",
      sort_order: 0,
      is_visible: true,
    },
    {
      title: "Health Goal Collections",
      description: "Browse wellness solutions organized around real health goals.",
      icon: "compass",
      sort_order: 1,
      is_visible: true,
    },
    {
      title: "Smart Comparisons",
      description: "Compare ingredients and wellness products side by side.",
      icon: "scale",
      sort_order: 2,
      is_visible: true,
    },
    {
      title: "Expert Guidance",
      description: "Get help choosing products that match your wellness needs.",
      icon: "stethoscope",
      sort_order: 3,
      is_visible: true,
    },
  ],
  floating_pills: [
    {
      label: "Weight Management",
      icon: "activity",
      link: "/category/weight-loss",
      sort_order: 0,
      is_visible: true,
    },
    {
      label: "Gut Health",
      icon: "leaf",
      link: "/category/gut-health",
      sort_order: 1,
      is_visible: true,
    },
    {
      label: "Sleep Support",
      icon: "moon",
      link: "/category/sleep-relaxation",
      sort_order: 2,
      is_visible: true,
    },
    {
      label: "Blood Sugar",
      icon: "candy",
      link: "/category/blood-sugar-diabetes",
      sort_order: 3,
      is_visible: true,
    },
    {
      label: "Immunity",
      icon: "shield-plus",
      link: "/category/immunity",
      sort_order: 4,
      is_visible: true,
    },
  ],
};

function textOrDefault(value: string | null | undefined, defaultValue: string) {
  return typeof value === "string" && value.trim() ? value : defaultValue;
}

export function mergeHomepageHeroCms(hero: Partial<HomepageHeroCms> | null | undefined) {
  const settings = hero?.settings
    ? {
        ...DEFAULT_HOMEPAGE_HERO.settings,
        ...hero.settings,
        badge_text: textOrDefault(
          hero.settings.badge_text,
          DEFAULT_HOMEPAGE_HERO.settings.badge_text,
        ),
        badge_icon: textOrDefault(
          hero.settings.badge_icon,
          DEFAULT_HOMEPAGE_HERO.settings.badge_icon,
        ),
        heading: textOrDefault(
          hero.settings.heading,
          DEFAULT_HOMEPAGE_HERO.settings.heading,
        ),
        highlight_heading: textOrDefault(
          hero.settings.highlight_heading,
          DEFAULT_HOMEPAGE_HERO.settings.highlight_heading,
        ),
        description: textOrDefault(
          hero.settings.description,
          DEFAULT_HOMEPAGE_HERO.settings.description,
        ),
        primary_cta_label: textOrDefault(
          hero.settings.primary_cta_label,
          DEFAULT_HOMEPAGE_HERO.settings.primary_cta_label,
        ),
        primary_cta_url: textOrDefault(
          hero.settings.primary_cta_url,
          DEFAULT_HOMEPAGE_HERO.settings.primary_cta_url,
        ),
        secondary_cta_label: textOrDefault(
          hero.settings.secondary_cta_label,
          DEFAULT_HOMEPAGE_HERO.settings.secondary_cta_label,
        ),
        secondary_cta_url: textOrDefault(
          hero.settings.secondary_cta_url,
          DEFAULT_HOMEPAGE_HERO.settings.secondary_cta_url,
        ),
        hero_image: textOrDefault(
          hero.settings.hero_image,
          DEFAULT_HOMEPAGE_HERO.settings.hero_image,
        ),
        hero_image_alt: textOrDefault(
          hero.settings.hero_image_alt,
          DEFAULT_HOMEPAGE_HERO.settings.hero_image_alt,
        ),
      }
    : DEFAULT_HOMEPAGE_HERO.settings;

  return {
    settings,
    trust_cards: (hero?.trust_cards?.length
      ? hero.trust_cards
      : DEFAULT_HOMEPAGE_HERO.trust_cards
    ).sort((a, b) => a.sort_order - b.sort_order),
    floating_pills: (hero?.floating_pills?.length
      ? hero.floating_pills
      : DEFAULT_HOMEPAGE_HERO.floating_pills
    ).sort((a, b) => a.sort_order - b.sort_order),
  };
}
