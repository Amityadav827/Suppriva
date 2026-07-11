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
  seo_focus_keyword?: string | null;
  seo_canonical_url?: string | null;
  seo_noindex?: boolean;
  seo_nofollow?: boolean;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidImageUrl(value: string) {
  if (!value) {
    return true;
  }

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

function isValidHttpUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function validateRichTextContent(content: JsonValue | undefined, errors: string[]) {
  if (content === undefined || content === null) {
    return;
  }

  if (!isRecord(content)) {
    errors.push("Blog content must be a structured rich text object.");
    return;
  }

  if ("body" in content && content.body !== undefined && typeof content.body !== "string") {
    errors.push("Blog content body must be text.");
    return;
  }

  if (typeof content.body === "string") {
    const body = content.body;
    const hasEmptyMarkdownHeading = body
      .replace(/\r\n/g, "\n")
      .split("\n")
      .some((line) => /^#{1,6}\s*$/.test(line.trim()));
    const hasEmptyHtmlHeading = /<h[1-6][^>]*>\s*(<br\s*\/?>)?\s*<\/h[1-6]>/i.test(body);
    const hasMissingImageSrc = /<img\b(?![^>]*\ssrc=["'][^"']+["'])[^>]*>/i.test(body);
    const invalidHref = [...body.matchAll(/<a\b[^>]*\shref=["']([^"']*)["'][^>]*>/gi)].find(
      (match) => {
        const href = match[1].trim();

        if (!href) {
          return true;
        }

        if (href.startsWith("#") || href.startsWith("/") || href.startsWith("mailto:")) {
          return false;
        }

        return !isValidHttpUrl(href);
      },
    );

    if (hasEmptyMarkdownHeading || hasEmptyHtmlHeading) {
      errors.push("Blog content headings cannot be empty.");
    }

    if (hasMissingImageSrc) {
      errors.push("Blog content images must include a source URL.");
    }

    if (invalidHref) {
      errors.push("Blog content links must use valid URLs.");
    }
  }

  if ("featuredImageMetadata" in content && content.featuredImageMetadata !== undefined) {
    if (!isRecord(content.featuredImageMetadata)) {
      errors.push("Featured image metadata must be a structured object.");
    } else {
      const metadata = content.featuredImageMetadata;

      if ("alt" in metadata && metadata.alt !== undefined && typeof metadata.alt !== "string") {
        errors.push("Featured image alt text must be text.");
      }

      if ("title" in metadata && metadata.title !== undefined && typeof metadata.title !== "string") {
        errors.push("Featured image title must be text.");
      }

      if (
        "caption" in metadata &&
        metadata.caption !== undefined &&
        typeof metadata.caption !== "string"
      ) {
        errors.push("Featured image caption must be text.");
      }
    }
  }
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

  if ("slug" in input && input.slug !== undefined && !input.slug.trim()) {
    errors.push("Blog slug is required.");
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
    "featured_image" in input &&
    input.featured_image &&
    !isValidImageUrl(input.featured_image)
  ) {
    errors.push("Featured image must be a valid URL or site-relative path.");
  }

  if ("featured_image" in input && input.featured_image && "content" in input) {
    const content = input.content;

    if (isRecord(content)) {
      const metadata = content.featuredImageMetadata;

      if (isRecord(metadata)) {
        const alt = typeof metadata.alt === "string" ? metadata.alt.trim() : "";
        const title = typeof metadata.title === "string" ? metadata.title.trim() : "";

        if (!alt) {
          errors.push("Featured image alt text is required.");
        }

        if (!title) {
          errors.push("Featured image title is required.");
        }
      }
    }
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

  for (const [label, value] of [
    ["SEO title", input.seo_title],
    ["Focus keyword", input.seo_focus_keyword],
    ["SEO description", input.seo_description],
  ] as const) {
    if (value !== undefined && value !== null && typeof value !== "string") {
      errors.push(`${label} must be text.`);
    }
  }

  if (
    "seo_canonical_url" in input &&
    input.seo_canonical_url &&
    !isValidHttpUrl(input.seo_canonical_url)
  ) {
    errors.push("Canonical URL override must be a valid HTTP or HTTPS URL.");
  }

  if ("seo_noindex" in input && input.seo_noindex !== undefined && !isBoolean(input.seo_noindex)) {
    errors.push("No Index must be true or false.");
  }

  if (
    "seo_nofollow" in input &&
    input.seo_nofollow !== undefined &&
    !isBoolean(input.seo_nofollow)
  ) {
    errors.push("No Follow must be true or false.");
  }

  if (
    "seo_keywords" in input &&
    input.seo_keywords !== undefined &&
    !isStringArray(input.seo_keywords)
  ) {
    errors.push("SEO keywords must be a list of text items.");
  }

  if ("content" in input) {
    validateRichTextContent(input.content, errors);
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
