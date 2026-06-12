import type { IngredientCreateInput } from "@/lib/validators/ingredient.validator";
import type { Ingredient } from "@/lib/database/types";

type IngredientQualityShape = Pick<
  IngredientCreateInput,
  "benefits" | "benefits_json" | "faq_json" | "seo_title" | "seo_description" | "meta_title" | "meta_description"
> &
  Partial<Pick<Ingredient, "name" | "slug">>;

export function getIngredientQualityWarnings(ingredient: IngredientQualityShape) {
  const warnings: string[] = [];

  if (!(ingredient.seo_title?.trim() || ingredient.meta_title?.trim())) {
    warnings.push("Missing SEO title");
  }

  if (!(ingredient.seo_description?.trim() || ingredient.meta_description?.trim())) {
    warnings.push("Missing SEO description");
  }

  const hasBenefits =
    Array.isArray(ingredient.benefits_json) && ingredient.benefits_json.length
      ? true
      : Array.isArray(ingredient.benefits) && ingredient.benefits.length > 0;

  if (!hasBenefits) {
    warnings.push("Missing benefits");
  }

  if (!Array.isArray(ingredient.faq_json) || ingredient.faq_json.length === 0) {
    warnings.push("Missing FAQ");
  }

  return warnings;
}
