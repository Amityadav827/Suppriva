import type {
  HomepageHeroCms,
  HomepageHeroFloatingPill,
  HomepageHeroSettings,
  HomepageHeroTrustCard,
} from "@/lib/homepage-hero";

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

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateHomepageHeroInput(input: Partial<HomepageHeroCms>) {
  const errors: string[] = [];
  const settings = input.settings as HomepageHeroSettings | undefined;

  if (!settings) {
    errors.push("Hero settings are required.");
  } else {
    [
      "badge_text",
      "badge_icon",
      "heading",
      "highlight_heading",
      "description",
      "primary_cta_label",
      "primary_cta_url",
      "secondary_cta_label",
      "secondary_cta_url",
      "hero_image",
      "hero_image_alt",
    ].forEach((field) => {
      if (!hasText(settings[field as keyof HomepageHeroSettings])) {
        errors.push(`Hero ${field.replaceAll("_", " ")} is required.`);
      }
    });

    if (settings.primary_cta_url && !isValidUrl(settings.primary_cta_url)) {
      errors.push("Primary CTA URL must be a relative path or http(s) URL.");
    }

    if (settings.secondary_cta_url && !isValidUrl(settings.secondary_cta_url)) {
      errors.push("Secondary CTA URL must be a relative path or http(s) URL.");
    }
  }

  validateRepeater(input.trust_cards, "Trust card", errors);
  validateRepeater(input.floating_pills, "Floating pill", errors, true);

  return {
    success: errors.length === 0,
    errors,
  };
}

function validateRepeater(
  items: HomepageHeroTrustCard[] | HomepageHeroFloatingPill[] | undefined,
  label: string,
  errors: string[],
  requireLink = false,
) {
  if (!Array.isArray(items)) {
    errors.push(`${label}s must be an array.`);
    return;
  }

  items.forEach((item, index) => {
    if (!hasText(item.icon)) {
      errors.push(`${label} ${index + 1} icon is required.`);
    }

    if ("title" in item && !hasText(item.title)) {
      errors.push(`${label} ${index + 1} title is required.`);
    }

    if ("label" in item && !hasText(item.label)) {
      errors.push(`${label} ${index + 1} label is required.`);
    }

    if ("description" in item && !hasText(item.description)) {
      errors.push(`${label} ${index + 1} description is required.`);
    }

    if (requireLink && "link" in item) {
      if (!hasText(item.link)) {
        errors.push(`${label} ${index + 1} link is required.`);
      } else if (!isValidUrl(item.link)) {
        errors.push(`${label} ${index + 1} link must be a relative path or http(s) URL.`);
      }
    }

    if (!Number.isInteger(item.sort_order) || item.sort_order < 0) {
      errors.push(`${label} ${index + 1} sort order must be a positive integer.`);
    }

    if (typeof item.is_visible !== "boolean") {
      errors.push(`${label} ${index + 1} visibility must be true or false.`);
    }
  });
}
