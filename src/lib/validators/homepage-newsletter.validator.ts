import type {
  HomepageNewsletterCms,
  HomepageNewsletterTrustChip,
} from "@/lib/homepage-newsletter";

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateHomepageNewsletterInput(
  input: Partial<HomepageNewsletterCms>,
) {
  const errors: string[] = [];
  const settings = input.settings;

  if (!settings) {
    errors.push("Newsletter settings are required.");
  } else {
    if (!hasText(settings.badge_text)) {
      errors.push("Newsletter badge is required.");
    }

    if (!hasText(settings.email_placeholder)) {
      errors.push("Newsletter email placeholder is required.");
    }

    if (!hasText(settings.button_label)) {
      errors.push("Newsletter button label is required.");
    }

    if (!hasText(settings.success_message)) {
      errors.push("Newsletter success message is required.");
    }

    if (!hasText(settings.error_message)) {
      errors.push("Newsletter error message is required.");
    }
  }

  if (!Array.isArray(input.trust_chips)) {
    errors.push("Newsletter trust chips must be an array.");
  } else {
    input.trust_chips.forEach((chip, index) =>
      validateTrustChip(chip, index, errors),
    );
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

function validateTrustChip(
  chip: HomepageNewsletterTrustChip,
  index: number,
  errors: string[],
) {
  if (!hasText(chip.label)) {
    errors.push(`Newsletter trust chip ${index + 1} label is required.`);
  }

  if (!Number.isInteger(chip.sort_order) || chip.sort_order < 0) {
    errors.push(
      `Newsletter trust chip ${index + 1} sort order must be a positive integer.`,
    );
  }

  if (typeof chip.is_visible !== "boolean") {
    errors.push(
      `Newsletter trust chip ${index + 1} visibility must be true or false.`,
    );
  }
}
