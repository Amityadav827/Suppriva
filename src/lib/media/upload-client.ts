"use client";

import type { MediaLibraryItem } from "@/lib/database/types";
import {
  MEDIA_LIBRARY_ACCEPT,
  MEDIA_LIBRARY_ALLOWED_TYPES,
  MEDIA_LIBRARY_MAX_FILE_SIZE,
} from "@/lib/media/constants";

export type UploadMediaLibraryFileInput = {
  file: File;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
};

async function readImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image dimensions."));
    };

    image.src = objectUrl;
  });
}

export function validateMediaLibraryFile(file: File) {
  if (!MEDIA_LIBRARY_ALLOWED_TYPES.includes(file.type as (typeof MEDIA_LIBRARY_ALLOWED_TYPES)[number])) {
    throw new Error("Only JPG, PNG, and WebP images are supported.");
  }

  if (file.size > MEDIA_LIBRARY_MAX_FILE_SIZE) {
    throw new Error("Image must be 5MB or smaller.");
  }
}

export async function uploadMediaLibraryFile(
  input: UploadMediaLibraryFileInput,
): Promise<MediaLibraryItem> {
  validateMediaLibraryFile(input.file);
  const dimensions = await readImageDimensions(input.file);

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("title", input.title?.trim() || input.file.name.replace(/\.[^.]+$/, ""));
    if (input.altText?.trim()) {
      formData.append("alt_text", input.altText.trim());
    }
    if (input.caption?.trim()) {
      formData.append("caption", input.caption.trim());
    }
    if (input.description?.trim()) {
      formData.append("description", input.description.trim());
    }
    if (input.tags?.length) {
      formData.append("tags", input.tags.join(", "));
    }
    formData.append("width", String(dimensions.width));
    formData.append("height", String(dimensions.height));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media-library/upload");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !input.onProgress) {
        return;
      }

      input.onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText || "{}") as {
          item?: MediaLibraryItem;
          error?: string;
        };

        if (xhr.status >= 200 && xhr.status < 300 && payload.item) {
          resolve(payload.item);
          return;
        }

        reject(new Error(payload.error || "Media upload failed."));
      } catch {
        reject(new Error("Unexpected upload response."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed. Please try again."));
    };

    xhr.send(formData);
  });
}

export { MEDIA_LIBRARY_ACCEPT };
