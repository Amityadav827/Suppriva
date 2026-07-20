import type {
  HomepageWellnessExpertCms,
  HomepageWellnessExpertSettings,
} from "@/lib/homepage-wellness-expert";

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

export function validateHomepageWellnessExpertInput(
  input: Partial<HomepageWellnessExpertCms>,
) {
  const errors: string[] = [];
  const settings = input.settings as HomepageWellnessExpertSettings | undefined;

  if (!settings) {
    errors.push("Wellness expert settings are required.");
  } else {
    [
      "badge_text",
      "badge_icon",
      "fallback_name",
      "fallback_designation",
      "fallback_bio",
      "fallback_secondary_bio",
      "fallback_image",
      "trust_line",
    ].forEach((field) => {
      if (!hasText(settings[field as keyof HomepageWellnessExpertSettings])) {
        errors.push(`Wellness expert ${field.replaceAll("_", " ")} is required.`);
      }
    });

    if (settings.fallback_image && !isValidUrl(settings.fallback_image)) {
      errors.push("Fallback image must be a relative path or http(s) URL.");
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
