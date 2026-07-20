import type {
  HomepageIngredientChip,
  HomepageIngredientsDiscoveryCms,
} from "@/lib/homepage-ingredients-discovery";

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

export function validateHomepageIngredientsDiscoveryInput(
  input: Partial<HomepageIngredientsDiscoveryCms>,
) {
  const errors: string[] = [];

  if (!Array.isArray(input.chips)) {
    errors.push("Ingredient chips must be an array.");
  } else {
    input.chips.forEach((chip, index) => {
      validateChip(chip, index, errors);
    });
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

function validateChip(
  chip: HomepageIngredientChip,
  index: number,
  errors: string[],
) {
  if (!hasText(chip.label)) {
    errors.push(`Ingredient chip ${index + 1} name is required.`);
  }

  if (!hasText(chip.icon)) {
    errors.push(`Ingredient chip ${index + 1} icon is required.`);
  }

  if (!hasText(chip.url)) {
    errors.push(`Ingredient chip ${index + 1} URL is required.`);
  } else if (!isValidUrl(chip.url)) {
    errors.push(
      `Ingredient chip ${index + 1} URL must be a relative path or http(s) URL.`,
    );
  }

  if (!Number.isInteger(chip.sort_order) || chip.sort_order < 0) {
    errors.push(`Ingredient chip ${index + 1} sort order must be a positive integer.`);
  }

  if (typeof chip.is_visible !== "boolean") {
    errors.push(`Ingredient chip ${index + 1} visibility must be true or false.`);
  }
}
