import { ContentStatus } from "@/lib/database/constants";
import type { Category } from "@/lib/database/types";

export type CategoryCreateInput = {
  title: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  status?: ContentStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[];
};

export type CategoryUpdateInput = Partial<CategoryCreateInput>;

export type CategoryValidationInput = CategoryCreateInput | CategoryUpdateInput;

export type CategoryValidationResult<TInput extends CategoryValidationInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function validateCategoryInput<TInput extends CategoryValidationInput>(
  input: TInput,
  mode: "create" | "update" = "create",
): CategoryValidationResult<TInput> {
  const errors: string[] = [];

  if (mode === "create" && !("title" in input && input.title?.trim())) {
    errors.push("Category title is required.");
  }

  if ("title" in input && input.title !== undefined && input.title.trim().length < 2) {
    errors.push("Category title must be at least 2 characters.");
  }

  if ("slug" in input && input.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }

  if (
    "status" in input &&
    input.status &&
    !Object.values(ContentStatus).includes(input.status)
  ) {
    errors.push("Status must be draft, published, or archived.");
  }

  if (
    "seo_keywords" in input &&
    input.seo_keywords !== undefined &&
    !isStringArray(input.seo_keywords)
  ) {
    errors.push("SEO keywords must be a list of text items.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}

export type CategoryRecordInput = Omit<
  Category,
  "id" | "name" | "created_at" | "updated_at" | "deleted_at"
>;
