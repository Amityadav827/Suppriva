export const INGREDIENT_LAYOUT_SECTION_DEFINITIONS = [
  {
    key: "overview",
    anchorId: "overview",
    name: "Overview",
    defaultTitle: "Overview",
    defaultSubtitle:
      "A practical medical-style summary of what this ingredient is and how it is commonly used.",
  },
  {
    key: "how_it_works",
    anchorId: "how-it-works",
    name: "How It Works",
    defaultTitle: "How It Works",
    defaultSubtitle:
      "A clear explanation of how this ingredient is commonly positioned in wellness formulas.",
  },
  {
    key: "benefits",
    anchorId: "benefits",
    name: "Benefits",
    defaultTitle: "Benefits",
    defaultSubtitle: "Responsive benefit cards generated directly from the ingredient record.",
  },
  {
    key: "uses",
    anchorId: "uses",
    name: "Uses",
    defaultTitle: "Common Uses",
    defaultSubtitle: "How shoppers commonly research and compare this ingredient.",
  },
  {
    key: "food_sources",
    anchorId: "food-sources",
    name: "Food Sources",
    defaultTitle: "Food Sources",
    defaultSubtitle: "Natural sources and common dietary context for this ingredient.",
  },
  {
    key: "dosage",
    anchorId: "dosage",
    name: "Typical Dosage",
    defaultTitle: "Typical Dosage",
    defaultSubtitle: "Serving context and label-review guidance for supplement shoppers.",
  },
  {
    key: "safety",
    anchorId: "safety-information",
    name: "Safety Information",
    defaultTitle: "Safety Information",
    defaultSubtitle:
      "Separate evidence-oriented cards for side effects, interactions, and avoidance notes.",
  },
  {
    key: "research",
    anchorId: "research",
    name: "Research",
    defaultTitle: "Research Notes",
    defaultSubtitle: "Educational research context and evidence notes for this ingredient.",
  },
  {
    key: "references",
    anchorId: "references",
    name: "References",
    defaultTitle: "References",
    defaultSubtitle: "Editorial references and source notes used for this ingredient profile.",
  },
  {
    key: "faq",
    anchorId: "faq",
    name: "FAQ",
    defaultTitle: "Frequently Asked Questions",
    defaultSubtitle: "Accordion answers built from the ingredient FAQ data for readers and schema output.",
  },
] as const;

export type IngredientLayoutSectionKey =
  (typeof INGREDIENT_LAYOUT_SECTION_DEFINITIONS)[number]["key"];

export const INGREDIENT_LAYOUT_SECTION_KEYS = INGREDIENT_LAYOUT_SECTION_DEFINITIONS.map(
  (section) => section.key,
) as IngredientLayoutSectionKey[];

export function getIngredientLayoutDefinition(key: string) {
  return INGREDIENT_LAYOUT_SECTION_DEFINITIONS.find((section) => section.key === key);
}

export function createDefaultIngredientLayoutSections() {
  return INGREDIENT_LAYOUT_SECTION_DEFINITIONS.map((section, index) => ({
    section_key: section.key,
    is_visible: true,
    sort_order: index,
    title_override: null,
    subtitle_override: null,
    background_style: "default" as const,
    animation_enabled: true,
  }));
}
