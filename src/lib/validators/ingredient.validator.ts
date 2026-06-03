export type IngredientCreateInput = {
  name: string;
  slug?: string;
  short_description?: string | null;
  full_description?: string | null;
  benefits?: string[];
  side_effects?: string[];
  dosage?: string | null;
  scientific_notes?: string | null;
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  is_featured?: boolean;
  product_ids?: string[];
};

export type IngredientUpdateInput = Partial<IngredientCreateInput>;

export type IngredientValidationInput = IngredientCreateInput | IngredientUpdateInput;

export type IngredientValidationResult<TInput extends IngredientValidationInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function validateIngredientInput<TInput extends IngredientValidationInput>(
  input: TInput,
  mode: "create" | "update" = "create",
): IngredientValidationResult<TInput> {
  const errors: string[] = [];

  if (mode === "create" && !("name" in input && input.name?.trim())) {
    errors.push("Ingredient name is required.");
  }

  if ("name" in input && input.name !== undefined && input.name.trim().length < 2) {
    errors.push("Ingredient name must be at least 2 characters.");
  }

  if ("slug" in input && input.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }

  if (
    "benefits" in input &&
    input.benefits !== undefined &&
    !isStringArray(input.benefits)
  ) {
    errors.push("Benefits must be a list of text items.");
  }

  if (
    "side_effects" in input &&
    input.side_effects !== undefined &&
    !isStringArray(input.side_effects)
  ) {
    errors.push("Side effects must be a list of text items.");
  }

  if (
    "is_featured" in input &&
    input.is_featured !== undefined &&
    typeof input.is_featured !== "boolean"
  ) {
    errors.push("Featured must be true or false.");
  }

  if (
    "product_ids" in input &&
    input.product_ids !== undefined &&
    (!isStringArray(input.product_ids) ||
      input.product_ids.some((productId) => !UUID_PATTERN.test(productId)))
  ) {
    errors.push("Related product IDs must be valid UUID values.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}
