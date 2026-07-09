import { ContentStatus } from "@/lib/database/constants";
import type { FAQItem, IngredientLayoutSection, JsonValue } from "@/lib/database/types";
import {
  INGREDIENT_LAYOUT_SECTION_KEYS,
  type IngredientLayoutSectionKey,
} from "@/lib/ingredient-layout";

export type IngredientCreateInput = {
  name: string;
  slug?: string;
  status?: ContentStatus;
  author_id?: string | null;
  reviewer_id?: string | null;
  scientific_name?: string | null;
  ingredient_category?: string | null;
  hero_badge?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  image_url?: string | null;
  rating?: number | null;
  evidence_level?: string | null;
  origin_country?: string | null;
  part_used?: string | null;
  ingredient_form?: string | null;
  taste_profile?: string | null;
  typical_dose?: string | null;
  best_for?: string | null;
  safety_level?: string | null;
  overview_title?: string | null;
  overview_subtitle?: string | null;
  overview_content?: string | null;
  how_it_works_title?: string | null;
  how_it_works_subtitle?: string | null;
  how_it_works_highlight_title?: string | null;
  how_it_works_highlight_description?: string | null;
  how_it_works_content?: string | null;
  interesting_fact_label?: string | null;
  interesting_fact?: string | null;
  benefits_title?: string | null;
  benefits_subtitle?: string | null;
  uses_title?: string | null;
  uses_subtitle?: string | null;
  uses_content?: string | null;
  uses_json?: JsonValue[];
  food_sources_title?: string | null;
  food_sources_subtitle?: string | null;
  food_sources_content?: string | null;
  food_sources_json?: JsonValue[];
  dosage_title?: string | null;
  dosage_subtitle?: string | null;
  dosage_content?: string | null;
  safety_title?: string | null;
  safety_subtitle?: string | null;
  research_title?: string | null;
  research_subtitle?: string | null;
  research_content?: string | null;
  research_json?: JsonValue[];
  references_title?: string | null;
  references_subtitle?: string | null;
  references_json?: JsonValue[];
  faq_title?: string | null;
  faq_subtitle?: string | null;
  benefits?: string[];
  side_effects?: string[];
  dosage?: string | null;
  scientific_notes?: string | null;
  benefits_json?: JsonValue[];
  side_effects_json?: JsonValue[];
  drug_interactions_json?: JsonValue[];
  who_should_avoid_json?: JsonValue[];
  faq_json?: FAQItem[];
  related_ingredients_json?: JsonValue[];
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_canonical_url?: string | null;
  seo_og_title?: string | null;
  seo_og_description?: string | null;
  seo_og_image?: string | null;
  seo_twitter_title?: string | null;
  seo_twitter_description?: string | null;
  seo_twitter_image?: string | null;
  meta_image?: string | null;
  seo_noindex?: boolean;
  seo_nofollow?: boolean;
  schema_json?: JsonValue;
  ingredient_layout_sections?: IngredientLayoutSectionInput[];
  is_featured?: boolean;
  product_ids?: string[];
};

export type IngredientLayoutSectionInput = Pick<
  IngredientLayoutSection,
  | "section_key"
  | "is_visible"
  | "sort_order"
  | "title_override"
  | "subtitle_override"
  | "background_style"
  | "animation_enabled"
>;

export type IngredientUpdateInput = Partial<IngredientCreateInput>;

export type IngredientValidationInput = IngredientCreateInput | IngredientUpdateInput;

export type IngredientValidationResult<TInput extends IngredientValidationInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value === "object") {
    return Object.values(value).every(isJsonValue);
  }

  return false;
}

function isJsonArray(value: unknown): value is JsonValue[] {
  return Array.isArray(value) && value.every(isJsonValue);
}

function isFaqArray(value: unknown): value is FAQItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "question" in item &&
        typeof item.question === "string" &&
        item.question.trim().length > 0 &&
        "answer" in item &&
        typeof item.answer === "string" &&
        item.answer.trim().length > 0,
    )
  );
}

function isTitleDescriptionArray(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "title" in item &&
        typeof item.title === "string" &&
        item.title.trim().length > 0 &&
        "description" in item &&
        typeof item.description === "string" &&
        item.description.trim().length > 0 &&
        (!("icon" in item) || typeof item.icon === "string"),
    )
  );
}

function isRelatedIngredientsArray(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "name" in item &&
        typeof item.name === "string" &&
        item.name.trim().length > 0 &&
        (!("slug" in item) || typeof item.slug === "string"),
    )
  );
}

function isIngredientLayoutSectionArray(value: unknown): value is IngredientLayoutSectionInput[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "section_key" in item &&
        INGREDIENT_LAYOUT_SECTION_KEYS.includes(item.section_key as IngredientLayoutSectionKey) &&
        "is_visible" in item &&
        typeof item.is_visible === "boolean" &&
        "sort_order" in item &&
        typeof item.sort_order === "number" &&
        Number.isInteger(item.sort_order) &&
        item.sort_order >= 0 &&
        (!("title_override" in item) ||
          item.title_override === null ||
          typeof item.title_override === "string") &&
        (!("subtitle_override" in item) ||
          item.subtitle_override === null ||
          typeof item.subtitle_override === "string") &&
        (!("background_style" in item) ||
          item.background_style === "default") &&
        (!("animation_enabled" in item) || typeof item.animation_enabled === "boolean"),
    )
  );
}

export function validateIngredientInput<TInput extends IngredientValidationInput>(
  input: TInput,
  mode: "create" | "update" = "create",
): IngredientValidationResult<TInput> {
  const errors: string[] = [];

  if (mode === "create" && !("name" in input && input.name?.trim())) {
    errors.push("Ingredient name is required.");
  }

  if ("name" in input && input.name !== undefined && input.name.trim().length < 2) {
    errors.push("Ingredient name must be at least 2 characters.");
  }

  if ("slug" in input && input.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }

  if ("author_id" in input && input.author_id && !UUID_PATTERN.test(input.author_id)) {
    errors.push("Author ID must be a valid UUID.");
  }

  if ("reviewer_id" in input && input.reviewer_id && !UUID_PATTERN.test(input.reviewer_id)) {
    errors.push("Reviewer ID must be a valid UUID.");
  }

  if (
    "status" in input &&
    input.status !== undefined &&
    !Object.values(ContentStatus).includes(input.status)
  ) {
    errors.push("Status must be draft, published, or archived.");
  }

  if (
    "rating" in input &&
    input.rating !== undefined &&
    input.rating !== null &&
    (typeof input.rating !== "number" || Number.isNaN(input.rating) || input.rating < 0)
  ) {
    errors.push("Rating must be a valid non-negative number.");
  }

  const hasHighlightTitle =
    "how_it_works_highlight_title" in input &&
    typeof input.how_it_works_highlight_title === "string" &&
    input.how_it_works_highlight_title.trim().length > 0;
  const hasHighlightDescription =
    "how_it_works_highlight_description" in input &&
    typeof input.how_it_works_highlight_description === "string" &&
    input.how_it_works_highlight_description.trim().length > 0;

  if (hasHighlightTitle !== hasHighlightDescription) {
    errors.push("How it works highlight card needs both a title and description.");
  }

  if (
    "benefits" in input &&
    input.benefits !== undefined &&
    !isStringArray(input.benefits)
  ) {
    errors.push("Benefits must be a list of text items.");
  }

  if (
    "side_effects" in input &&
    input.side_effects !== undefined &&
    !isStringArray(input.side_effects)
  ) {
    errors.push("Side effects must be a list of text items.");
  }

  if (
    "benefits_json" in input &&
    input.benefits_json !== undefined &&
    !isTitleDescriptionArray(input.benefits_json)
  ) {
    errors.push("Benefits JSON must be a list of title and description items.");
  }

  if (
    "side_effects_json" in input &&
    input.side_effects_json !== undefined &&
    !isTitleDescriptionArray(input.side_effects_json)
  ) {
    errors.push("Side effects JSON must be a list of title and description items.");
  }

  if (
    "drug_interactions_json" in input &&
    input.drug_interactions_json !== undefined &&
    !isJsonArray(input.drug_interactions_json)
  ) {
    errors.push("Drug interactions JSON must be a valid list.");
  }

  if (
    "who_should_avoid_json" in input &&
    input.who_should_avoid_json !== undefined &&
    !isJsonArray(input.who_should_avoid_json)
  ) {
    errors.push("Who should avoid JSON must be a valid list.");
  }

  if (
    "related_ingredients_json" in input &&
    input.related_ingredients_json !== undefined &&
    !isRelatedIngredientsArray(input.related_ingredients_json)
  ) {
    errors.push("Related ingredients JSON must be a list of related ingredient entries.");
  }

  if ("faq_json" in input && input.faq_json !== undefined && !isFaqArray(input.faq_json)) {
    errors.push("FAQ JSON must be a list of question and answer items.");
  }

  if ("faq_json" in input && input.faq_json !== undefined && isFaqArray(input.faq_json)) {
    const questions = input.faq_json.map((item) => item.question.trim().toLowerCase());
    if (new Set(questions).size !== questions.length) {
      errors.push("FAQ JSON cannot contain duplicate questions.");
    }
  }

  for (const key of [
    "uses_json",
    "food_sources_json",
    "research_json",
    "references_json",
  ] as const) {
    if (key in input && input[key] !== undefined && !isJsonArray(input[key])) {
      errors.push(`${key} must be a valid list.`);
    }
  }

  if (
    "schema_json" in input &&
    input.schema_json !== undefined &&
    !isJsonValue(input.schema_json)
  ) {
    errors.push("Schema JSON must be valid JSON.");
  }

  if (
    "ingredient_layout_sections" in input &&
    input.ingredient_layout_sections !== undefined
  ) {
    if (!isIngredientLayoutSectionArray(input.ingredient_layout_sections)) {
      errors.push("Ingredient layout sections must be valid dashboard layout rows.");
    } else {
      const keys = input.ingredient_layout_sections.map((item) => item.section_key);
      if (new Set(keys).size !== keys.length) {
        errors.push("Ingredient layout sections cannot contain duplicate sections.");
      }
    }
  }

  if (
    "is_featured" in input &&
    input.is_featured !== undefined &&
    typeof input.is_featured !== "boolean"
  ) {
    errors.push("Featured must be true or false.");
  }

  if (
    "product_ids" in input &&
    input.product_ids !== undefined &&
    (!isStringArray(input.product_ids) ||
      input.product_ids.some((productId) => !UUID_PATTERN.test(productId)))
  ) {
    errors.push("Related product IDs must be valid UUID values.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}
