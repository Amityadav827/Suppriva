import type {
  HomepageWhyChooseCard,
  HomepageWhyChooseCms,
} from "@/lib/homepage-why-choose";

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateHomepageWhyChooseInput(
  input: Partial<HomepageWhyChooseCms>,
) {
  const errors: string[] = [];

  if (!Array.isArray(input.cards)) {
    errors.push("Why Choose cards must be an array.");
  } else {
    input.cards.forEach((card, index) => validateCard(card, index, errors));
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

function validateCard(
  card: HomepageWhyChooseCard,
  index: number,
  errors: string[],
) {
  if (!hasText(card.icon)) {
    errors.push(`Why Choose card ${index + 1} icon is required.`);
  }

  if (!hasText(card.title)) {
    errors.push(`Why Choose card ${index + 1} title is required.`);
  }

  if (!hasText(card.description)) {
    errors.push(`Why Choose card ${index + 1} description is required.`);
  }

  if (!Number.isInteger(card.sort_order) || card.sort_order < 0) {
    errors.push(
      `Why Choose card ${index + 1} sort order must be a positive integer.`,
    );
  }

  if (typeof card.is_visible !== "boolean") {
    errors.push(`Why Choose card ${index + 1} visibility must be true or false.`);
  }
}
