import {
  isHomepagePopularPickSortMode,
  isHomepagePopularPickSourceMode,
  type HomepagePopularPicksCms,
  type HomepagePopularPicksSettings,
} from "@/lib/homepage-popular-picks";

export function validateHomepagePopularPicksInput(
  input: Partial<HomepagePopularPicksCms>,
) {
  const errors: string[] = [];
  const settings = input.settings as HomepagePopularPicksSettings | undefined;

  if (!settings) {
    errors.push("Popular Picks display settings are required.");
  } else {
    if (!Number.isInteger(settings.max_products) || settings.max_products < 1) {
      errors.push("Maximum products to display must be at least 1.");
    }

    if (settings.max_products > 20) {
      errors.push("Maximum products to display cannot be greater than 20.");
    }

    if (!isHomepagePopularPickSortMode(settings.sort_mode)) {
      errors.push(
        "Product sort mode must be latest, featured, highest rated, or manual priority.",
      );
    }

    if (!isHomepagePopularPickSourceMode(settings.source_mode)) {
      errors.push("Product source mode must be automatic or featured products only.");
    }

    if (typeof settings.show_product_rating !== "boolean") {
      errors.push("Show product rating must be true or false.");
    }

    if (typeof settings.show_product_category !== "boolean") {
      errors.push("Show product category must be true or false.");
    }

    if (typeof settings.show_product_cta !== "boolean") {
      errors.push("Show product CTA must be true or false.");
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
