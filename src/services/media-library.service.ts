import { isAdmin } from "@/lib/auth/admin";
import { DATABASE_TABLES } from "@/lib/database/constants";
import type { MediaLibraryItem } from "@/lib/database/types";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  MEDIA_LIBRARY_BUCKET,
  buildMediaLibraryUrl,
  getExtensionFromFileName,
  getExtensionFromMimeType,
  slugifyMediaValue,
} from "@/lib/media/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  MediaLibraryCreateInput,
  MediaLibraryUpdateInput,
  MediaLibraryUploadInput,
} from "@/lib/validators/media-library.validator";
import {
  normalizeMediaTags,
  validateMediaLibraryCreateInput,
  validateMediaLibraryUpdateInput,
  validateMediaLibraryUploadInput,
} from "@/lib/validators/media-library.validator";
import {
  type MediaLibraryFilters,
  SupabaseMediaLibraryRepository,
} from "@/repositories/media-library.repository";

type UploadMediaFileInput = MediaLibraryUploadInput & {
  fileBuffer: ArrayBuffer;
};

export class MediaLibraryService {
  constructor(
    private readonly mediaLibraryRepository = new SupabaseMediaLibraryRepository(),
  ) {}

  async listMedia(filters?: MediaLibraryFilters) {
    await this.assertAdmin();
    return this.mediaLibraryRepository.listMedia(filters);
  }

  async getMediaById(id: string) {
    await this.assertAdmin();
    return this.requireMedia(id);
  }

  async uploadMediaFile(input: UploadMediaFileInput) {
    await this.assertAdmin();
    const normalizedInput = this.normalizeUploadInput(input);
    const validation = validateMediaLibraryUploadInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const adminSupabase = createSupabaseAdminClient();
    await this.verifyMediaLibraryBucket(adminSupabase);
    const baseSlug =
      normalizedInput.title?.trim() ||
      slugifyMediaValue(normalizedInput.originalFileName.replace(/\.[^.]+$/, "")) ||
      "media-asset";
    const extension =
      getExtensionFromFileName(normalizedInput.originalFileName) ||
      getExtensionFromMimeType(normalizedInput.mime_type);

    if (!extension) {
      throw new ValidationError("Image extension could not be determined.");
    }

    const fileName = await this.generateUniqueFileName(baseSlug, extension);
    const fileUrl = buildMediaLibraryUrl(fileName);
    const fileArray = new Uint8Array(normalizedInput.fileBuffer);

    const { error: uploadError } = await adminSupabase.storage
      .from(MEDIA_LIBRARY_BUCKET)
      .upload(fileName, fileArray, {
        contentType: normalizedInput.mime_type,
        upsert: false,
      });

    if (uploadError) {
      if (this.isMissingMediaLibraryBucketError(uploadError)) {
        throw this.createMissingMediaLibraryBucketError();
      }
      throw new AppError(uploadError.message, "MEDIA_UPLOAD_FAILED", 500);
    }

    const createInput: MediaLibraryCreateInput = {
      file_name: fileName,
      file_url: fileUrl,
      title: normalizedInput.title || "Media asset",
      alt_text: normalizedInput.alt_text,
      caption: normalizedInput.caption,
      description: normalizedInput.description,
      slug: fileName.replace(/\.[^.]+$/, ""),
      tags: normalizedInput.tags,
      width: normalizedInput.width,
      height: normalizedInput.height,
      file_size: normalizedInput.file_size,
      mime_type: normalizedInput.mime_type,
    };

    const createValidation = validateMediaLibraryCreateInput(createInput);
    if (!createValidation.success) {
      await adminSupabase.storage.from(MEDIA_LIBRARY_BUCKET).remove([fileName]);
      throw new ValidationError(createValidation.errors.join(" "));
    }

    try {
      return await this.createMediaRecord(adminSupabase, createInput);
    } catch (error) {
      await adminSupabase.storage.from(MEDIA_LIBRARY_BUCKET).remove([fileName]);
      throw error;
    }
  }

  async updateMedia(id: string, input: MediaLibraryUpdateInput) {
    await this.assertAdmin();
    const current = await this.requireMedia(id);
    const normalizedInput = this.normalizeUpdateInput(input, current);
    const validation = validateMediaLibraryUpdateInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const desiredSlug =
      normalizedInput.slug?.trim() ||
      slugifyMediaValue(normalizedInput.title?.trim() || current.title) ||
      current.slug;

    let nextFileName = current.file_name;
    let nextFileUrl = current.file_url;

    if (desiredSlug !== current.slug) {
      const extension =
        getExtensionFromFileName(current.file_name) ||
        getExtensionFromMimeType(current.mime_type);
      nextFileName = await this.generateUniqueFileName(desiredSlug, extension, current.id);
      nextFileUrl = buildMediaLibraryUrl(nextFileName);

      const adminSupabase = createSupabaseAdminClient();
      const { error } = await adminSupabase.storage
        .from(MEDIA_LIBRARY_BUCKET)
        .move(current.file_name, nextFileName);

      if (error) {
        if (this.isMissingMediaLibraryBucketError(error)) {
          throw this.createMissingMediaLibraryBucketError();
        }
        throw new AppError(error.message, "MEDIA_RENAME_FAILED", 500);
      }
    }

    return this.updateMediaRecord(createSupabaseAdminClient(), id, {
      ...normalizedInput,
      slug: desiredSlug,
      file_name: nextFileName,
      file_url: nextFileUrl,
    });
  }

  async deleteMedia(id: string) {
    await this.assertAdmin();
    const current = await this.requireMedia(id);
    const adminSupabase = createSupabaseAdminClient();

    const { error: removeError } = await adminSupabase.storage
      .from(MEDIA_LIBRARY_BUCKET)
      .remove([current.file_name]);

    if (removeError) {
      if (this.isMissingMediaLibraryBucketError(removeError)) {
        throw this.createMissingMediaLibraryBucketError();
      }
      throw new AppError(removeError.message, "MEDIA_DELETE_FAILED", 500);
    }

    await this.deleteMediaRecord(adminSupabase, id);
  }

  private async requireMedia(id: string) {
    const media = await this.mediaLibraryRepository.getMediaById(id);

    if (!media) {
      throw new AppError("Media item not found.", "MEDIA_NOT_FOUND", 404);
    }

    return media;
  }

  private normalizeUploadInput(input: UploadMediaFileInput): UploadMediaFileInput {
    const fallbackTitle =
      input.title?.trim() || input.originalFileName.replace(/\.[^.]+$/, "").trim();

    return {
      ...input,
      title: fallbackTitle || "Media asset",
      alt_text: this.cleanText(input.alt_text),
      caption: this.cleanText(input.caption),
      description: this.cleanText(input.description),
      tags: normalizeMediaTags(input.tags),
      width: this.cleanDimension(input.width),
      height: this.cleanDimension(input.height),
    };
  }

  private normalizeUpdateInput(
    input: MediaLibraryUpdateInput,
    current: MediaLibraryItem,
  ): MediaLibraryUpdateInput {
    return {
      ...input,
      title: input.title?.trim() || current.title,
      alt_text: this.cleanText(input.alt_text),
      caption: this.cleanText(input.caption),
      description: this.cleanText(input.description),
      slug:
        input.slug !== undefined
          ? slugifyMediaValue(input.slug)
          : undefined,
      tags: input.tags ? normalizeMediaTags(input.tags) : undefined,
    };
  }

  private cleanText(value: string | null | undefined) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private cleanDimension(value: number | null | undefined) {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return null;
    }

    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
  }

  private async assertAdmin() {
    if (!(await isAdmin())) {
      throw new AppError("Admin access is required.", "ADMIN_REQUIRED", 403);
    }
  }

  private async verifyMediaLibraryBucket(supabase: ReturnType<typeof createSupabaseAdminClient>) {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return;
    }

    const hasBucket = (buckets ?? []).some(
      (bucket) =>
        bucket.id === MEDIA_LIBRARY_BUCKET || bucket.name === MEDIA_LIBRARY_BUCKET,
    );

    if (!hasBucket) {
      throw this.createMissingMediaLibraryBucketError();
    }
  }

  private isMissingMediaLibraryBucketError(error: { message?: string | null }) {
    const message = error.message?.toLowerCase() ?? "";
    return message.includes("bucket not found");
  }

  private createMissingMediaLibraryBucketError() {
    return new AppError(
      'Media Storage bucket is not configured. Please create bucket "media-library" in Supabase Storage.',
      "MEDIA_BUCKET_NOT_CONFIGURED",
      500,
    );
  }

  private isMissingMediaLibraryTableError(error: { code?: string | null; message?: string | null }) {
    const message = error.message?.toLowerCase() ?? "";
    return error.code === "PGRST205" || error.code === "42P01" || (
      message.includes("media_library") && message.includes("schema cache")
    );
  }

  private createMissingMediaLibraryTableError() {
    return new AppError(
      "Media Library database setup is missing. Run SUPABASE_MEDIA_LIBRARY_SETUP.sql in Supabase SQL Editor, then reload the PostgREST schema cache.",
      "MEDIA_LIBRARY_TABLE_NOT_CONFIGURED",
      500,
    );
  }

  private async createMediaRecord(
    supabase: ReturnType<typeof createSupabaseAdminClient>,
    input: MediaLibraryCreateInput,
  ) {
    const { data, error } = await supabase
      .from(DATABASE_TABLES.mediaLibrary)
      .insert({
        ...input,
        tags: input.tags ?? [],
      })
      .select("*")
      .single();

    if (error) {
      if (this.isMissingMediaLibraryTableError(error)) {
        throw this.createMissingMediaLibraryTableError();
      }
      throw new AppError(error.message, "MEDIA_METADATA_CREATE_FAILED", 500);
    }

    return data as MediaLibraryItem;
  }

  private async updateMediaRecord(
    supabase: ReturnType<typeof createSupabaseAdminClient>,
    id: string,
    input: MediaLibraryUpdateInput & Partial<MediaLibraryCreateInput>,
  ) {
    const payload: Record<string, unknown> = {};

    if ("file_name" in input) payload.file_name = input.file_name;
    if ("file_url" in input) payload.file_url = input.file_url;
    if ("title" in input) payload.title = input.title;
    if ("alt_text" in input) payload.alt_text = input.alt_text ?? null;
    if ("caption" in input) payload.caption = input.caption ?? null;
    if ("description" in input) payload.description = input.description ?? null;
    if ("slug" in input) payload.slug = input.slug;
    if ("tags" in input) payload.tags = input.tags ?? [];
    if ("width" in input) payload.width = input.width ?? null;
    if ("height" in input) payload.height = input.height ?? null;
    if ("file_size" in input) payload.file_size = input.file_size ?? null;
    if ("mime_type" in input) payload.mime_type = input.mime_type;

    const { data, error } = await supabase
      .from(DATABASE_TABLES.mediaLibrary)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (this.isMissingMediaLibraryTableError(error)) {
        throw this.createMissingMediaLibraryTableError();
      }
      throw new AppError(error.message, "MEDIA_METADATA_UPDATE_FAILED", 500);
    }

    return data as MediaLibraryItem;
  }

  private async deleteMediaRecord(
    supabase: ReturnType<typeof createSupabaseAdminClient>,
    id: string,
  ) {
    const { error } = await supabase
      .from(DATABASE_TABLES.mediaLibrary)
      .delete()
      .eq("id", id);

    if (error) {
      if (this.isMissingMediaLibraryTableError(error)) {
        throw this.createMissingMediaLibraryTableError();
      }
      throw new AppError(error.message, "MEDIA_METADATA_DELETE_FAILED", 500);
    }
  }

  private async generateUniqueFileName(baseSlug: string, extension: string, currentId?: string) {
    const normalizedBase = slugifyMediaValue(baseSlug) || "media-asset";
    let attempt = 0;

    while (attempt < 50) {
      const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
      const fileName = `${normalizedBase}${suffix}.${extension}`;
      const existing = await this.mediaLibraryRepository.getMediaByFileName(fileName);

      if (!existing || existing.id === currentId) {
        return fileName;
      }

      attempt += 1;
    }

    throw new AppError(
      "Unable to generate a unique media file name.",
      "MEDIA_FILENAME_CONFLICT",
      409,
    );
  }
}
