import type { IngredientCreateInput } from "@/lib/validators/ingredient.validator";
import type { Ingredient } from "@/lib/database/types";

type IngredientQualityShape = Pick<
  IngredientCreateInput,
  | "benefits"
  | "benefits_json"
  | "side_effects_json"
  | "faq_json"
  | "seo_title"
  | "seo_description"
  | "meta_title"
  | "meta_description"
> &
  Partial<Pick<Ingredient, "name" | "slug">>;

function hasCompleteTitleDescriptionItems(items: IngredientQualityShape["benefits_json"]) {
  return (
    Array.isArray(items) &&
    items.some((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return false;
      }

      const title = "title" in item && typeof item.title === "string" ? item.title.trim() : "";
      const description =
        "description" in item && typeof item.description === "string"
          ? item.description.trim()
          : "";

      return Boolean(title && description);
    })
  );
}

function hasIncompleteTitleDescriptionItems(items: IngredientQualityShape["benefits_json"]) {
  return (
    Array.isArray(items) &&
    items.some((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return false;
      }

      const title = "title" in item && typeof item.title === "string" ? item.title.trim() : "";
      const description =
        "description" in item && typeof item.description === "string"
          ? item.description.trim()
          : "";

      return Boolean(title || description) && !(title && description);
    })
  );
}

export function getIngredientQualityWarnings(ingredient: IngredientQualityShape) {
  const warnings: string[] = [];

  if (!(ingredient.seo_title?.trim() || ingredient.meta_title?.trim())) {
    warnings.push("Missing SEO title");
  }

  if (!(ingredient.seo_description?.trim() || ingredient.meta_description?.trim())) {
    warnings.push("Missing SEO description");
  }

  const hasBenefits =
    hasCompleteTitleDescriptionItems(ingredient.benefits_json) ||
    (Array.isArray(ingredient.benefits) && ingredient.benefits.length > 0);

  if (!hasBenefits) {
    warnings.push("Missing benefits");
  }

  if (hasIncompleteTitleDescriptionItems(ingredient.benefits_json)) {
    warnings.push("Benefits need both title and description");
  }

  if (hasIncompleteTitleDescriptionItems(ingredient.side_effects_json)) {
    warnings.push("Side effects need both title and description");
  }

  if (!Array.isArray(ingredient.faq_json) || ingredient.faq_json.length === 0) {
    warnings.push("Missing FAQ");
  }

  return warnings;
}
