import {
  MEDIA_LIBRARY_ALLOWED_TYPES,
  MEDIA_LIBRARY_MAX_FILE_SIZE,
  slugifyMediaValue,
} from "@/lib/media/constants";

export type MediaLibraryCreateInput = {
  file_name: string;
  file_url: string;
  title: string;
  alt_text?: string | null;
  caption?: string | null;
  description?: string | null;
  slug?: string;
  tags?: string[];
  width?: number | null;
  height?: number | null;
  file_size?: number | null;
  mime_type: string;
};

export type MediaLibraryUpdateInput = Partial<
  Omit<MediaLibraryCreateInput, "file_name" | "file_url" | "mime_type" | "file_size" | "width" | "height">
>;

export type MediaLibraryUploadInput = {
  originalFileName: string;
  title?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  description?: string | null;
  tags?: string[];
  mime_type: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
};

type ValidationResult<TInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isOptionalPositiveInteger(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "number" && Number.isInteger(value) && value >= 0)
  );
}

export function normalizeMediaTags(tags: string[] | undefined) {
  return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
}

export function validateMediaLibraryCreateInput<TInput extends MediaLibraryCreateInput>(
  input: TInput,
): ValidationResult<TInput> {
  const errors: string[] = [];

  if (!input.file_name?.trim()) {
    errors.push("File name is required.");
  }

  if (!input.file_url?.trim()) {
    errors.push("File URL is required.");
  }

  if (!input.title?.trim()) {
    errors.push("Title is required.");
  }

  if (!input.mime_type?.trim()) {
    errors.push("MIME type is required.");
  } else if (!MEDIA_LIBRARY_ALLOWED_TYPES.includes(input.mime_type as (typeof MEDIA_LIBRARY_ALLOWED_TYPES)[number])) {
    errors.push("Only JPG, PNG, and WebP images are supported.");
  }

  if (!isStringArray(input.tags ?? [])) {
    errors.push("Tags must be a list of text values.");
  }

  if (!isOptionalPositiveInteger(input.width)) {
    errors.push("Width must be a positive whole number.");
  }

  if (!isOptionalPositiveInteger(input.height)) {
    errors.push("Height must be a positive whole number.");
  }

  if (!isOptionalPositiveInteger(input.file_size)) {
    errors.push("File size must be a positive whole number.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}

export function validateMediaLibraryUpdateInput<TInput extends MediaLibraryUpdateInput>(
  input: TInput,
): ValidationResult<TInput> {
  const errors: string[] = [];

  if ("title" in input && input.title !== undefined && !input.title?.trim()) {
    errors.push("Title is required.");
  }

  if ("slug" in input && input.slug !== undefined && input.slug.trim()) {
    const normalized = slugifyMediaValue(input.slug);

    if (normalized !== input.slug.trim()) {
      errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
    }
  }

  if ("tags" in input && input.tags !== undefined && !isStringArray(input.tags)) {
    errors.push("Tags must be a list of text values.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}

export function validateMediaLibraryUploadInput<TInput extends MediaLibraryUploadInput>(
  input: TInput,
): ValidationResult<TInput> {
  const errors: string[] = [];

  if (!input.originalFileName?.trim()) {
    errors.push("Original file name is required.");
  }

  if (!input.mime_type?.trim()) {
    errors.push("MIME type is required.");
  } else if (!MEDIA_LIBRARY_ALLOWED_TYPES.includes(input.mime_type as (typeof MEDIA_LIBRARY_ALLOWED_TYPES)[number])) {
    errors.push("Only JPG, PNG, and WebP images are supported.");
  }

  if (!Number.isFinite(input.file_size) || input.file_size <= 0) {
    errors.push("File size must be provided.");
  } else if (input.file_size > MEDIA_LIBRARY_MAX_FILE_SIZE) {
    errors.push("Image must be 5MB or smaller.");
  }

  if (!isOptionalPositiveInteger(input.width)) {
    errors.push("Width must be a positive whole number.");
  }

  if (!isOptionalPositiveInteger(input.height)) {
    errors.push("Height must be a positive whole number.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}
