export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "health_needs",
  "popular_picks",
  "ingredients_discovery",
  "wellness_expert",
  "blogs",
  "discover_wellness_solutions",
  "why_choose_suppriva",
  "trust_badges",
  "newsletter",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];
type Timestamp = string;

export type HomepageSectionConfig = {
  id?: string;
  section_key: HomepageSectionKey;
  section_name: string;
  is_visible: boolean;
  sort_order: number;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  {
    section_key: "hero",
    section_name: "Hero",
    is_visible: true,
    sort_order: 0,
    title: "Discover Wellness Solutions That Fit Your Goals",
    subtitle:
      "Explore supplements, ingredient insights, and wellness collections designed to help you make informed health decisions with confidence.",
    cta_label: "Explore Wellness Categories",
    cta_url: "/category",
  },
  {
    section_key: "health_needs",
    section_name: "Health Needs",
    is_visible: true,
    sort_order: 1,
    title: "Explore By Health Needs",
    subtitle: "Browse focused wellness categories curated for everyday health goals.",
    cta_label: null,
    cta_url: null,
  },
  {
    section_key: "popular_picks",
    section_name: "Popular Picks",
    is_visible: true,
    sort_order: 2,
    title: "Popular Picks & Best Supplements",
    subtitle: "A polished starting point for high-intent supplement shoppers.",
    cta_label: null,
    cta_url: null,
  },
  {
    section_key: "ingredients_discovery",
    section_name: "Ingredients Discovery",
    is_visible: true,
    sort_order: 3,
    title: "Explore By Ingredients",
    subtitle:
      "Discover vitamins, herbs, minerals, probiotics, adaptogens, and functional ingredients.",
    cta_label: "View All Ingredients",
    cta_url: "/ingredients",
  },
  {
    section_key: "wellness_expert",
    section_name: "Wellness Expert",
    is_visible: true,
    sort_order: 4,
    title: "Meet Our Wellness Expert",
    subtitle:
      "Our educational wellness content and ingredient resources are supported by expert guidance to help readers make more informed wellness decisions.",
    cta_label: "Explore Our Experts",
    cta_url: "/experts",
  },
  {
    section_key: "blogs",
    section_name: "Blogs",
    is_visible: true,
    sort_order: 5,
    title: "Supplements Blog & Guides",
    subtitle: "Expert wellness insights, supplement reviews & health guides.",
    cta_label: "View All Blogs",
    cta_url: "/blogs",
  },
  {
    section_key: "discover_wellness_solutions",
    section_name: "Discover Wellness Solutions",
    is_visible: true,
    sort_order: 6,
    title: "Discover Wellness Solutions",
    subtitle:
      "Explore trusted supplements, ingredient-focused products, and wellness collections designed for informed choices.",
    cta_label: "Explore Wellness Categories",
    cta_url: "/category",
  },
  {
    section_key: "why_choose_suppriva",
    section_name: "Why Choose Suppriva",
    is_visible: true,
    sort_order: 7,
    title: "Your Wellness Journey Starts Here",
    subtitle:
      "Explore trusted supplements, ingredient insights, wellness solutions, and expert guidance-all in one place.",
    cta_label: null,
    cta_url: null,
  },
  {
    section_key: "trust_badges",
    section_name: "Trust Badges",
    is_visible: true,
    sort_order: 8,
    title: "Why Thousands Start Their Wellness Journey with Suppriva",
    subtitle:
      "Discover supplements, ingredients, wellness solutions, and expert insights designed to help you make informed health decisions.",
    cta_label: null,
    cta_url: null,
  },
  {
    section_key: "newsletter",
    section_name: "Newsletter",
    is_visible: true,
    sort_order: 9,
    title: "Stay Updated With Health & Wellness Tips",
    subtitle:
      "Subscribe to get exclusive offers, wellness tips, and the latest supplement insights.",
    cta_label: null,
    cta_url: null,
  },
];

export function isHomepageSectionKey(value: string): value is HomepageSectionKey {
  return (HOMEPAGE_SECTION_KEYS as readonly string[]).includes(value);
}

export function mergeHomepageSections(
  sections: HomepageSectionConfig[] | null | undefined,
) {
  const sectionMap = new Map(
    (sections ?? [])
      .filter((section) => isHomepageSectionKey(section.section_key))
      .map((section) => [section.section_key, section]),
  );

  const withDefaultText = (
    value: string | null | undefined,
    defaultValue: string | null,
  ) => {
    if (typeof value === "string" && value.trim()) {
      return value;
    }

    return defaultValue;
  };

  return DEFAULT_HOMEPAGE_SECTIONS.map((defaultSection) => {
    const savedSection = sectionMap.get(defaultSection.section_key);

    return {
      ...defaultSection,
      ...savedSection,
      section_name: savedSection?.section_name || defaultSection.section_name,
      title: withDefaultText(savedSection?.title, defaultSection.title),
      subtitle: withDefaultText(savedSection?.subtitle, defaultSection.subtitle),
      cta_label: withDefaultText(savedSection?.cta_label, defaultSection.cta_label),
      cta_url: withDefaultText(savedSection?.cta_url, defaultSection.cta_url),
    };
  }).sort((a, b) => a.sort_order - b.sort_order);
}

export function getHomepageSectionByKey(
  sections: HomepageSectionConfig[],
  sectionKey: HomepageSectionKey,
) {
  return sections.find((section) => section.section_key === sectionKey);
}
