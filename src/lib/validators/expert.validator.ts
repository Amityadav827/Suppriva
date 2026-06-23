import { EXPERT_STATUSES, type ExpertStatus } from "@/lib/database/constants";

export type ExpertCreateInput = {
  name: string;
  slug?: string;
  profile_image?: string | null;
  designation?: string | null;
  short_bio?: string | null;
  full_bio?: string | null;
  experience_years?: number | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  email?: string | null;
  expertise_tags?: string[];
  status?: ExpertStatus;
  display_order?: number;
  featured_on_homepage?: boolean;
  linked_author_id?: string | null;
  linked_reviewer_id?: string | null;
};

export type ExpertUpdateInput = Partial<ExpertCreateInput>;

export type ExpertValidationInput = ExpertCreateInput | ExpertUpdateInput;

export type ExpertValidationResult<TInput extends ExpertValidationInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateExpertInput<TInput extends ExpertValidationInput>(
  input: TInput,
  mode: "create" | "update" = "create",
): ExpertValidationResult<TInput> {
  const errors: string[] = [];

  if (mode === "create" && !("name" in input && input.name?.trim())) {
    errors.push("Name is required.");
  }

  if ("name" in input && input.name !== undefined && input.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  if ("slug" in input && input.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }

  if (
    "experience_years" in input &&
    input.experience_years !== undefined &&
    input.experience_years !== null &&
    (!Number.isInteger(input.experience_years) || input.experience_years < 0)
  ) {
    errors.push("Experience must be a valid non-negative whole number.");
  }

  if (
    "display_order" in input &&
    input.display_order !== undefined &&
    input.display_order !== null &&
    (!Number.isInteger(input.display_order) || input.display_order < 0)
  ) {
    errors.push("Display order must be a valid non-negative whole number.");
  }

  if ("linkedin_url" in input && input.linkedin_url && !isValidUrl(input.linkedin_url)) {
    errors.push("LinkedIn URL must be a valid URL.");
  }

  if ("website_url" in input && input.website_url && !isValidUrl(input.website_url)) {
    errors.push("Website URL must be a valid URL.");
  }

  if ("profile_image" in input && input.profile_image && !isValidUrl(input.profile_image)) {
    errors.push("Profile image URL must be a valid URL.");
  }

  if ("email" in input && input.email && !isValidEmail(input.email)) {
    errors.push("Email must be a valid email address.");
  }

  if (
    "status" in input &&
    input.status !== undefined &&
    input.status !== null &&
    !EXPERT_STATUSES.includes(input.status)
  ) {
    errors.push("Expert status is invalid.");
  }

  if (
    "featured_on_homepage" in input &&
    input.featured_on_homepage !== undefined &&
    typeof input.featured_on_homepage !== "boolean"
  ) {
    errors.push("Homepage feature toggle must be true or false.");
  }

  if ("expertise_tags" in input && input.expertise_tags !== undefined) {
    if (!Array.isArray(input.expertise_tags)) {
      errors.push("Expertise tags must be an array.");
    } else if (input.expertise_tags.some((tag) => typeof tag !== "string" || !tag.trim())) {
      errors.push("Expertise tags must contain valid text values.");
    }
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}
