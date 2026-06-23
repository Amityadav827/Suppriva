import type { ExpertQueryStatus } from "@/lib/database/types";

export const EXPERT_QUERY_TYPES = [
  "General Wellness Guidance",
  "Ingredient Guidance",
  "Safety Information",
  "Usage Support",
  "Product Advice",
] as const;

export const EXPERT_QUERY_STATUSES = ["new", "contacted", "resolved"] as const;

export type ExpertQueryCreateInput = {
  name: string;
  email: string;
  category?: string | null;
  expert_id?: string | null;
  product_name?: string | null;
  product_url?: string | null;
  question_type: string;
  message: string;
  source_page?: string | null;
};

export type ExpertQueryUpdateInput = {
  status: ExpertQueryStatus;
};

export type ExpertQueryValidationResult<TInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateExpertQueryInput<TInput extends ExpertQueryCreateInput>(
  input: TInput,
): ExpertQueryValidationResult<TInput> {
  const errors: string[] = [];

  if (!input.name?.trim()) {
    errors.push("Name is required.");
  }

  if (!input.email?.trim()) {
    errors.push("Email is required.");
  } else if (!EMAIL_PATTERN.test(input.email)) {
    errors.push("Email must be valid.");
  }

  if (!input.question_type?.trim()) {
    errors.push("Question type is required.");
  } else if (
    !EXPERT_QUERY_TYPES.includes(
      input.question_type.trim() as (typeof EXPERT_QUERY_TYPES)[number],
    )
  ) {
    errors.push("Question type is invalid.");
  }

  if (!input.message?.trim()) {
    errors.push("Message is required.");
  }

  if (input.name?.trim().length > 120) {
    errors.push("Name must be 120 characters or fewer.");
  }

  if (input.email?.trim().length > 180) {
    errors.push("Email must be 180 characters or fewer.");
  }

  if (input.category?.trim().length && input.category.trim().length > 120) {
    errors.push("Category must be 120 characters or fewer.");
  }

  if (input.product_name?.trim().length && input.product_name.trim().length > 180) {
    errors.push("Product name must be 180 characters or fewer.");
  }

  if (input.product_url?.trim().length && input.product_url.trim().length > 500) {
    errors.push("Product URL must be 500 characters or fewer.");
  }

  if (input.message?.trim().length > 4000) {
    errors.push("Message must be 4000 characters or fewer.");
  }

  if (!input.product_name?.trim() && !input.category?.trim()) {
    errors.push("Either a product context or category is required.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}

export function validateExpertQueryStatusUpdate<TInput extends ExpertQueryUpdateInput>(
  input: TInput,
): ExpertQueryValidationResult<TInput> {
  const errors: string[] = [];

  if (!input.status?.trim()) {
    errors.push("Status is required.");
  } else if (
    !EXPERT_QUERY_STATUSES.includes(input.status.trim() as ExpertQueryStatus)
  ) {
    errors.push("Status is invalid.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}
