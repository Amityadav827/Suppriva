import type {
  HomepageTrustBadge,
  HomepageTrustBadgesCms,
} from "@/lib/homepage-trust-badges";

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateHomepageTrustBadgesInput(
  input: Partial<HomepageTrustBadgesCms>,
) {
  const errors: string[] = [];

  if (!Array.isArray(input.badges)) {
    errors.push("Trust badges must be an array.");
  } else {
    input.badges.forEach((badge, index) => validateBadge(badge, index, errors));
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

function validateBadge(
  badge: HomepageTrustBadge,
  index: number,
  errors: string[],
) {
  if (!hasText(badge.icon)) {
    errors.push(`Trust badge ${index + 1} icon is required.`);
  }

  if (!hasText(badge.title)) {
    errors.push(`Trust badge ${index + 1} title is required.`);
  }

  if (!hasText(badge.description)) {
    errors.push(`Trust badge ${index + 1} description is required.`);
  }

  if (!Number.isInteger(badge.sort_order) || badge.sort_order < 0) {
    errors.push(`Trust badge ${index + 1} sort order must be a positive integer.`);
  }

  if (typeof badge.is_visible !== "boolean") {
    errors.push(`Trust badge ${index + 1} visibility must be true or false.`);
  }
}
