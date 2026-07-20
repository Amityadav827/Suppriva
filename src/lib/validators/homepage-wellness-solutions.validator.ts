import type {
  HomepageWellnessSolutionFeatureCard,
  HomepageWellnessSolutionsCms,
  HomepageWellnessSolutionShowcaseProduct,
} from "@/lib/homepage-wellness-solutions";

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidUrl(value: string) {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateHomepageWellnessSolutionsInput(
  input: Partial<HomepageWellnessSolutionsCms>,
) {
  const errors: string[] = [];
  const settings = input.settings;

  if (!settings) {
    errors.push("Discover Wellness Solutions settings are required.");
  } else {
    if (!hasText(settings.left_badge)) {
      errors.push("Left feature badge is required.");
    }

    if (!hasText(settings.left_heading)) {
      errors.push("Left feature heading is required.");
    }

    if (!hasText(settings.left_description)) {
      errors.push("Left feature description is required.");
    }

    if (!hasText(settings.left_cta_label)) {
      errors.push("Left feature CTA label is required.");
    }

    if (!hasText(settings.left_cta_url)) {
      errors.push("Left feature CTA URL is required.");
    } else if (!isValidUrl(settings.left_cta_url)) {
      errors.push("Left feature CTA URL must be a relative path or http(s) URL.");
    }
  }

  if (!Array.isArray(input.feature_cards)) {
    errors.push("Feature cards must be an array.");
  } else {
    input.feature_cards.forEach((card, index) =>
      validateFeatureCard(card, index, errors),
    );
  }

  if (!Array.isArray(input.showcase_products)) {
    errors.push("Showcase products must be an array.");
  } else {
    input.showcase_products.forEach((product, index) =>
      validateShowcaseProduct(product, index, errors),
    );
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

function validateFeatureCard(
  card: HomepageWellnessSolutionFeatureCard,
  index: number,
  errors: string[],
) {
  if (!hasText(card.icon)) {
    errors.push(`Feature card ${index + 1} icon is required.`);
  }

  if (!hasText(card.title)) {
    errors.push(`Feature card ${index + 1} title is required.`);
  }

  if (!hasText(card.description)) {
    errors.push(`Feature card ${index + 1} description is required.`);
  }

  if (!Number.isInteger(card.sort_order) || card.sort_order < 0) {
    errors.push(`Feature card ${index + 1} sort order must be a positive integer.`);
  }

  if (typeof card.is_visible !== "boolean") {
    errors.push(`Feature card ${index + 1} visibility must be true or false.`);
  }
}

function validateShowcaseProduct(
  product: HomepageWellnessSolutionShowcaseProduct,
  index: number,
  errors: string[],
) {
  if (!hasText(product.product_name)) {
    errors.push(`Showcase product ${index + 1} name is required.`);
  }

  if (!hasText(product.label)) {
    errors.push(`Showcase product ${index + 1} label is required.`);
  }

  if (!hasText(product.url)) {
    errors.push(`Showcase product ${index + 1} URL is required.`);
  } else if (!isValidUrl(product.url)) {
    errors.push(
      `Showcase product ${index + 1} URL must be a relative path or http(s) URL.`,
    );
  }

  if (!Number.isInteger(product.sort_order) || product.sort_order < 0) {
    errors.push(
      `Showcase product ${index + 1} sort order must be a positive integer.`,
    );
  }

  if (typeof product.is_visible !== "boolean") {
    errors.push(`Showcase product ${index + 1} visibility must be true or false.`);
  }
}
