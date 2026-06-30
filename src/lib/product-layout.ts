export const PRODUCT_LAYOUT_SECTION_DEFINITIONS = [
  {
    key: "hero",
    anchorId: "hero",
    name: "Hero",
    defaultTitle: "Overview",
    defaultSubtitle: "",
  },
  {
    key: "overview",
    anchorId: "what-is-product",
    name: "Overview",
    defaultTitle: "Overview",
    defaultSubtitle: "",
  },
  {
    key: "standout",
    anchorId: "why-it-stands-out",
    name: "Why It Stands Out",
    defaultTitle: "Why It Stands Out",
    defaultSubtitle: "",
  },
  {
    key: "how_it_works",
    anchorId: "how-it-works",
    name: "How It Works",
    defaultTitle: "How It Works",
    defaultSubtitle: "",
  },
  {
    key: "benefits",
    anchorId: "benefits",
    name: "Key Benefits",
    defaultTitle: "Key Benefits",
    defaultSubtitle: "",
  },
  {
    key: "ingredients",
    anchorId: "ingredients",
    name: "Ingredient Breakdown",
    defaultTitle: "Ingredient Breakdown",
    defaultSubtitle: "",
  },
  {
    key: "best_for",
    anchorId: "who-is-it-best-for",
    name: "Who Is It Best For",
    defaultTitle: "Who Is It Best For",
    defaultSubtitle: "",
  },
  {
    key: "safety",
    anchorId: "safety",
    name: "Safety Information",
    defaultTitle: "Safety Information",
    defaultSubtitle: "",
  },
  {
    key: "pros_cons",
    anchorId: "pros-cons",
    name: "Pros & Cons",
    defaultTitle: "Pros & Cons",
    defaultSubtitle: "",
  },
  {
    key: "buying",
    anchorId: "where-to-buy",
    name: "Where To Buy",
    defaultTitle: "Where To Buy",
    defaultSubtitle: "",
  },
  {
    key: "faq",
    anchorId: "faq",
    name: "FAQ",
    defaultTitle: "Frequently Asked Questions",
    defaultSubtitle: "",
  },
  {
    key: "verdict",
    anchorId: "verdict",
    name: "Verdict",
    defaultTitle: "SuppRiva Verdict",
    defaultSubtitle: "",
  },
  {
    key: "related_ingredients",
    anchorId: "related-ingredients",
    name: "Related Ingredients",
    defaultTitle: "Related Ingredients",
    defaultSubtitle: "",
  },
  {
    key: "related_blogs",
    anchorId: "learn-more",
    name: "Related Blogs",
    defaultTitle: "Learn More",
    defaultSubtitle: "",
  },
  {
    key: "compare",
    anchorId: "compare-alternatives",
    name: "Compare Alternatives",
    defaultTitle: "Compare Alternatives",
    defaultSubtitle: "",
  },
  {
    key: "related_products",
    anchorId: "related-products",
    name: "Related Products",
    defaultTitle: "Related Products",
    defaultSubtitle: "",
  },
  {
    key: "health_needs",
    anchorId: "explore-health-needs",
    name: "Explore By Health Needs",
    defaultTitle: "Explore By Health Needs",
    defaultSubtitle: "",
  },
] as const;

export type ProductLayoutSectionKey =
  (typeof PRODUCT_LAYOUT_SECTION_DEFINITIONS)[number]["key"];

export const PRODUCT_LAYOUT_SECTION_KEYS = PRODUCT_LAYOUT_SECTION_DEFINITIONS.map(
  (section) => section.key,
) as ProductLayoutSectionKey[];

export function getProductLayoutDefinition(key: string) {
  return PRODUCT_LAYOUT_SECTION_DEFINITIONS.find((section) => section.key === key);
}
