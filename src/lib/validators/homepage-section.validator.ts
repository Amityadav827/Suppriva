import {
  HOMEPAGE_SECTION_KEYS,
  isHomepageSectionKey,
  type HomepageSectionKey,
} from "@/lib/homepage-sections";

export type HomepageSectionInput = {
  section_key: HomepageSectionKey;
  section_name?: string | null;
  is_visible?: boolean;
  sort_order?: number;
  title?: string | null;
  subtitle?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
};

export type HomepageSectionsUpdateInput = {
  sections: HomepageSectionInput[];
};

function isValidCtaUrl(value: string) {
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

export function validateHomepageSectionsInput(input: unknown) {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { success: false, errors: ["Homepage sections payload is required."] };
  }

  const sections = (input as HomepageSectionsUpdateInput).sections;

  if (!Array.isArray(sections)) {
    return { success: false, errors: ["Sections must be an array."] };
  }

  const seenKeys = new Set<string>();

  sections.forEach((section, index) => {
    if (!section || typeof section !== "object") {
      errors.push(`Section ${index + 1} must be an object.`);
      return;
    }

    if (!isHomepageSectionKey(String(section.section_key))) {
      errors.push(`Section ${index + 1} has an invalid key.`);
    }

    if (seenKeys.has(String(section.section_key))) {
      errors.push(`Section ${section.section_key} is duplicated.`);
    }

    seenKeys.add(String(section.section_key));

    if (
      "is_visible" in section &&
      section.is_visible !== undefined &&
      typeof section.is_visible !== "boolean"
    ) {
      errors.push(`Section ${section.section_key} visibility must be true or false.`);
    }

    if (
      "sort_order" in section &&
      section.sort_order !== undefined &&
      (!Number.isInteger(section.sort_order) || section.sort_order < 0)
    ) {
      errors.push(`Section ${section.section_key} sort order must be a positive integer.`);
    }

    if (section.cta_url?.trim() && !isValidCtaUrl(section.cta_url.trim())) {
      errors.push(
        `Section ${section.section_key} CTA URL must be a relative path or http(s) URL.`,
      );
    }
  });

  const validKeys = new Set(HOMEPAGE_SECTION_KEYS);
  seenKeys.forEach((key) => {
    if (!validKeys.has(key as HomepageSectionKey)) {
      errors.push(`Section ${key} is not supported.`);
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}
