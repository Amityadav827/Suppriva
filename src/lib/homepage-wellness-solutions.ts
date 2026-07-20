import { buySellShowcaseProducts } from "@/lib/constants";

type Timestamp = string;

export type HomepageWellnessSolutionsSettings = {
  id?: string;
  left_badge: string;
  left_heading: string;
  left_description: string;
  left_cta_label: string;
  left_cta_url: string;
  bottom_description: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageWellnessSolutionFeatureCard = {
  id?: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageWellnessSolutionShowcaseProduct = {
  id?: string;
  product_name: string;
  label: string;
  url: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageWellnessSolutionsCms = {
  settings: HomepageWellnessSolutionsSettings;
  feature_cards: HomepageWellnessSolutionFeatureCard[];
  showcase_products: HomepageWellnessSolutionShowcaseProduct[];
};

export const DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS: HomepageWellnessSolutionsCms = {
  settings: {
    left_badge: "Curated Wellness Collection",
    left_heading: "Discover Supplements That Match Your Wellness Goals",
    left_description:
      "Explore curated wellness solutions, ingredient-focused products, and popular health categories-all designed to help users make informed choices.",
    left_cta_label: "Explore Wellness Categories",
    left_cta_url: "/category",
    bottom_description:
      "Explore wellness products organized by health goals, ingredients, and lifestyle needs.",
  },
  feature_cards: [
    {
      title: "Organized by Health Goals",
      description: "Browse supplements grouped around real wellness objectives.",
      icon: "compass",
      sort_order: 0,
      is_visible: true,
    },
    {
      title: "Ingredient-Focused Discovery",
      description:
        "Find products through vitamins, herbs, minerals, probiotics, and functional ingredients.",
      icon: "leaf",
      sort_order: 1,
      is_visible: true,
    },
    {
      title: "Easy Product Comparisons",
      description: "Understand formulas, ingredients, and benefits side by side.",
      icon: "scale",
      sort_order: 2,
      is_visible: true,
    },
    {
      title: "Updated Wellness Collections",
      description:
        "Discover featured products and trending wellness categories regularly.",
      icon: "sparkles",
      sort_order: 3,
      is_visible: true,
    },
  ],
  showcase_products: buySellShowcaseProducts.map((product, index) => ({
    product_name: product.name,
    label: product.status,
    url: product.href,
    sort_order: index,
    is_visible: true,
  })),
};

export function mergeHomepageWellnessSolutionsCms(
  input: Partial<HomepageWellnessSolutionsCms> | null | undefined,
) {
  const settings = input?.settings;
  const featureCards = input?.feature_cards?.length
    ? input.feature_cards
    : DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS.feature_cards;
  const showcaseProducts = input?.showcase_products?.length
    ? input.showcase_products
    : DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS.showcase_products;

  return {
    settings: {
      ...DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS.settings,
      ...settings,
      left_badge:
        settings?.left_badge?.trim() ||
        DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS.settings.left_badge,
      left_heading:
        settings?.left_heading?.trim() ||
        DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS.settings.left_heading,
      left_description:
        settings?.left_description?.trim() ||
        DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS.settings.left_description,
      left_cta_label:
        settings?.left_cta_label?.trim() ||
        DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS.settings.left_cta_label,
      left_cta_url:
        settings?.left_cta_url?.trim() ||
        DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS.settings.left_cta_url,
      bottom_description:
        settings?.bottom_description?.trim() ||
        DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS.settings.bottom_description,
    },
    feature_cards: [...featureCards].sort((a, b) => a.sort_order - b.sort_order),
    showcase_products: [...showcaseProducts].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  };
}

export function getDefaultShowcaseProductMeta(productName: string, url: string) {
  const normalizedName = productName.trim().toLowerCase();
  const normalizedUrl = url.trim().toLowerCase();

  return buySellShowcaseProducts.find(
    (product) =>
      product.name.toLowerCase() === normalizedName ||
      product.href.toLowerCase() === normalizedUrl,
  );
}
