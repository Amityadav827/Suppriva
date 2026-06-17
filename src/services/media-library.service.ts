import { isAdmin } from "@/lib/auth/admin";
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
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

    const supabase = await createSupabaseServerClient();
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

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_LIBRARY_BUCKET)
      .upload(fileName, fileArray, {
        contentType: normalizedInput.mime_type,
        upsert: false,
      });

    if (uploadError) {
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
      await supabase.storage.from(MEDIA_LIBRARY_BUCKET).remove([fileName]);
      throw new ValidationError(createValidation.errors.join(" "));
    }

    try {
      return await this.mediaLibraryRepository.createMedia(createInput);
    } catch (error) {
      await supabase.storage.from(MEDIA_LIBRARY_BUCKET).remove([fileName]);
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

      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.storage
        .from(MEDIA_LIBRARY_BUCKET)
        .move(current.file_name, nextFileName);

      if (error) {
        throw new AppError(error.message, "MEDIA_RENAME_FAILED", 500);
      }
    }

    return this.mediaLibraryRepository.updateMedia(id, {
      ...normalizedInput,
      slug: desiredSlug,
      file_name: nextFileName,
      file_url: nextFileUrl,
    });
  }

  async deleteMedia(id: string) {
    await this.assertAdmin();
    const current = await this.requireMedia(id);
    const supabase = await createSupabaseServerClient();

    const { error: removeError } = await supabase.storage
      .from(MEDIA_LIBRARY_BUCKET)
      .remove([current.file_name]);

    if (removeError) {
      throw new AppError(removeError.message, "MEDIA_DELETE_FAILED", 500);
    }

    await this.mediaLibraryRepository.deleteMedia(id);
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
