import { ContentStatus } from "@/lib/database/constants";
import type { FAQItem, Ingredient, JsonValue, Product } from "@/lib/database/types";

export type ProductCreateInput = {
  category_id?: string | null;
  title: string;
  slug?: string;
  short_description?: string | null;
  full_description?: string | null;
  image?: string | null;
  gallery?: string[];
  rating?: number | null;
  affiliate_url?: string | null;
  ingredients?: Ingredient[];
  benefits?: JsonValue[];
  pros?: string[];
  cons?: string[];
  faq?: FAQItem[];
  status?: ContentStatus;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

export type ProductValidationInput = ProductCreateInput | ProductUpdateInput;

export type ProductValidationResult<TInput extends ProductValidationInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isFaqArray(value: unknown): value is FAQItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "question" in item &&
        "answer" in item &&
        typeof item.question === "string" &&
        typeof item.answer === "string",
    )
  );
}

function isIngredientArray(value: unknown): value is Ingredient[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "name" in item &&
        typeof item.name === "string",
    )
  );
}

export function validateProductInput<TInput extends ProductValidationInput>(
  input: TInput,
  mode: "create" | "update" = "create",
): ProductValidationResult<TInput> {
  const errors: string[] = [];

  if (mode === "create" && !("title" in input && input.title?.trim())) {
    errors.push("Product title is required.");
  }

  if ("title" in input && input.title !== undefined && input.title.trim().length < 2) {
    errors.push("Product title must be at least 2 characters.");
  }

  if ("slug" in input && input.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }

  if (
    "category_id" in input &&
    input.category_id &&
    !UUID_PATTERN.test(input.category_id)
  ) {
    errors.push("Category ID must be a valid UUID.");
  }

  if (
    "status" in input &&
    input.status &&
    !Object.values(ContentStatus).includes(input.status)
  ) {
    errors.push("Status must be draft, published, or archived.");
  }

  if (
    "rating" in input &&
    input.rating !== undefined &&
    input.rating !== null &&
    (input.rating < 0 || input.rating > 5)
  ) {
    errors.push("Rating must be between 0 and 5.");
  }

  if ("gallery" in input && input.gallery !== undefined && !isStringArray(input.gallery)) {
    errors.push("Gallery must be a list of image URLs.");
  }

  if ("pros" in input && input.pros !== undefined && !isStringArray(input.pros)) {
    errors.push("Pros must be a list of text items.");
  }

  if ("cons" in input && input.cons !== undefined && !isStringArray(input.cons)) {
    errors.push("Cons must be a list of text items.");
  }

  if (
    "ingredients" in input &&
    input.ingredients !== undefined &&
    !isIngredientArray(input.ingredients)
  ) {
    errors.push("Ingredients must be valid ingredient objects.");
  }

  if ("faq" in input && input.faq !== undefined && !isFaqArray(input.faq)) {
    errors.push("FAQ must be valid question and answer objects.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}

export type ProductRecordInput = Omit<
  Product,
  "id" | "name" | "created_at" | "updated_at" | "deleted_at"
>;
