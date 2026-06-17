export type AffiliateClickCreateInput = {
  product_id?: string;
  product_slug?: string;
  source_page?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  ip_hash?: string | null;
  country?: string | null;
  session_id?: string | null;
};

export type AffiliateClickValidationResult<TInput extends AffiliateClickCreateInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateAffiliateClickInput<TInput extends AffiliateClickCreateInput>(
  input: TInput,
): AffiliateClickValidationResult<TInput> {
  const errors: string[] = [];

  if (!input.product_id && !input.product_slug) {
    errors.push("Product ID or product slug is required.");
  }

  if (input.product_id && !UUID_PATTERN.test(input.product_id)) {
    errors.push("Product ID must be a valid UUID.");
  }

  if (
    input.product_slug &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.product_slug)
  ) {
    errors.push("Product slug must use lowercase letters, numbers, and hyphens only.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}
