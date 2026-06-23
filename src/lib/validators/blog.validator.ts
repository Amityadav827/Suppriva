import { ContentStatus } from "@/lib/database/constants";
import type { Blog, JsonValue } from "@/lib/database/types";

export type BlogCreateInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content?: JsonValue;
  featured_image?: string | null;
  category_id?: string | null;
  author_id?: string | null;
  reviewer_id?: string | null;
  reading_time?: string | null;
  tags?: string[];
  status?: ContentStatus;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[];
};

export type BlogUpdateInput = Partial<BlogCreateInput>;

export type BlogValidationInput = BlogCreateInput | BlogUpdateInput;

export type BlogValidationResult<TInput extends BlogValidationInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function validateBlogInput<TInput extends BlogValidationInput>(
  input: TInput,
  mode: "create" | "update" = "create",
): BlogValidationResult<TInput> {
  const errors: string[] = [];

  if (mode === "create" && !("title" in input && input.title?.trim())) {
    errors.push("Blog title is required.");
  }

  if ("title" in input && input.title !== undefined && input.title.trim().length < 2) {
    errors.push("Blog title must be at least 2 characters.");
  }

  if ("slug" in input && input.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }

  if (
    "category_id" in input &&
    input.category_id &&
    !UUID_PATTERN.test(input.category_id)
  ) {
    errors.push("Category ID must be a valid UUID.");
  }

  if ("author_id" in input && input.author_id && !UUID_PATTERN.test(input.author_id)) {
    errors.push("Author ID must be a valid UUID.");
  }

  if ("reviewer_id" in input && input.reviewer_id && !UUID_PATTERN.test(input.reviewer_id)) {
    errors.push("Reviewer ID must be a valid UUID.");
  }

  if (
    "status" in input &&
    input.status &&
    !Object.values(ContentStatus).includes(input.status)
  ) {
    errors.push("Status must be draft, published, or archived.");
  }

  if ("tags" in input && input.tags !== undefined && !isStringArray(input.tags)) {
    errors.push("Tags must be a list of text items.");
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

export type BlogRecordInput = Omit<
  Blog,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;
