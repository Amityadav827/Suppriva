export type ExpertProfileCreateInput = {
  name: string;
  slug?: string;
  photo_url?: string | null;
  designation?: string | null;
  qualification?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  email?: string | null;
  is_active?: boolean;
};

export type ExpertProfileUpdateInput = Partial<ExpertProfileCreateInput>;

export type ExpertProfileValidationInput =
  | ExpertProfileCreateInput
  | ExpertProfileUpdateInput;

export type ExpertProfileValidationResult<TInput extends ExpertProfileValidationInput> = {
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

export function validateExpertProfileInput<TInput extends ExpertProfileValidationInput>(
  input: TInput,
  mode: "create" | "update" = "create",
): ExpertProfileValidationResult<TInput> {
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

  if ("linkedin_url" in input && input.linkedin_url && !isValidUrl(input.linkedin_url)) {
    errors.push("LinkedIn URL must be a valid URL.");
  }

  if ("website_url" in input && input.website_url && !isValidUrl(input.website_url)) {
    errors.push("Website URL must be a valid URL.");
  }

  if ("photo_url" in input && input.photo_url && !isValidUrl(input.photo_url)) {
    errors.push("Photo URL must be a valid URL.");
  }

  if ("email" in input && input.email && !isValidEmail(input.email)) {
    errors.push("Email must be a valid email address.");
  }

  if ("is_active" in input && input.is_active !== undefined && typeof input.is_active !== "boolean") {
    errors.push("Status toggle must be true or false.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}
