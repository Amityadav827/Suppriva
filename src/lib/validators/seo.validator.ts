import { PageType } from "@/lib/database/constants";
import type { JsonValue, SEO } from "@/lib/database/types";

export type SeoCreateInput = {
  page_type: PageType;
  page_slug: string;
  meta_title: string;
  meta_description: string;
  canonical_url?: string | null;
  schema_json?: JsonValue;
};

export type SeoUpdateInput = Partial<SeoCreateInput>;

export type SeoValidationInput = SeoCreateInput | SeoUpdateInput;

export type SeoValidationResult<TInput extends SeoValidationInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(isJsonValue);
  }

  return false;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSeoInput<TInput extends SeoValidationInput>(
  input: TInput,
  mode: "create" | "update" = "create",
): SeoValidationResult<TInput> {
  const errors: string[] = [];

  if (mode === "create" && !("page_type" in input && input.page_type)) {
    errors.push("Page type is required.");
  }

  if (
    "page_type" in input &&
    input.page_type &&
    !Object.values(PageType).includes(input.page_type)
  ) {
    errors.push("Page type is invalid.");
  }

  if (mode === "create" && !("page_slug" in input && input.page_slug?.trim())) {
    errors.push("Page slug is required.");
  }

  if ("page_slug" in input && input.page_slug !== undefined && !input.page_slug.trim()) {
    errors.push("Page slug cannot be empty.");
  }

  if (mode === "create" && !("meta_title" in input && input.meta_title?.trim())) {
    errors.push("Meta title is required.");
  }

  if (
    "meta_title" in input &&
    input.meta_title !== undefined &&
    input.meta_title.trim().length < 5
  ) {
    errors.push("Meta title must be at least 5 characters.");
  }

  if (
    mode === "create" &&
    !("meta_description" in input && input.meta_description?.trim())
  ) {
    errors.push("Meta description is required.");
  }

  if (
    "meta_description" in input &&
    input.meta_description !== undefined &&
    input.meta_description.trim().length < 20
  ) {
    errors.push("Meta description must be at least 20 characters.");
  }

  if (
    "canonical_url" in input &&
    input.canonical_url &&
    !isValidUrl(input.canonical_url)
  ) {
    errors.push("Canonical URL must be a valid http or https URL.");
  }

  if (
    "schema_json" in input &&
    input.schema_json !== undefined &&
    !isJsonValue(input.schema_json)
  ) {
    errors.push("Schema JSON must be valid JSON.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}

export type SeoRecordInput = Omit<
  SEO,
  "id" | "page_id" | "updated_at" | "deleted_at"
>;
