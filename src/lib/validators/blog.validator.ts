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

  const hasEmptyHeading =
    typeof content.body === "string" &&
    content.body
      .replace(/\r\n/g, "\n")
      .split("\n")
      .some((line) => /^#{1,6}\s*$/.test(line.trim()));

  if (hasEmptyHeading) {
    errors.push("Blog content headings cannot be empty.");
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

  if ("faqs" in content && content.faqs !== undefined) {
    if (!Array.isArray(content.faqs)) {
      errors.push("Blog FAQ must be a list of question and answer items.");
      return;
    }

    const seenQuestions = new Set<string>();

    content.faqs.forEach((item, index) => {
      if (!isRecord(item)) {
        errors.push(`Blog FAQ ${index + 1} must be a question and answer object.`);
        return;
      }

      const question = typeof item.question === "string" ? item.question.trim() : "";
      const answer = typeof item.answer === "string" ? item.answer.trim() : "";

      if (!question && !answer) {
        return;
      }

      if (!question) {
        errors.push(`Blog FAQ ${index + 1} question is required.`);
      }

      if (!answer) {
        errors.push(`Blog FAQ ${index + 1} answer is required.`);
      }

      const normalizedQuestion = question.toLowerCase();

      if (normalizedQuestion && seenQuestions.has(normalizedQuestion)) {
        errors.push(`Blog FAQ ${index + 1} duplicates another question.`);
      }

      if (normalizedQuestion) {
        seenQuestions.add(normalizedQuestion);
      }
    });
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
