import { ContentStatus } from "@/lib/database/constants";
import type { FAQItem, JsonValue } from "@/lib/database/types";

export type IngredientCreateInput = {
  name: string;
  slug?: string;
  status?: ContentStatus;
  scientific_name?: string | null;
  ingredient_category?: string | null;
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
  overview_content?: string | null;
  how_it_works_content?: string | null;
  interesting_fact?: string | null;
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
  is_featured?: boolean;
  product_ids?: string[];
};

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
        "answer" in item &&
        typeof item.answer === "string",
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
        "description" in item &&
        typeof item.description === "string",
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
        (!("slug" in item) || typeof item.slug === "string"),
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
