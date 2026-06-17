export const MEDIA_LIBRARY_BUCKET = "media-library";
export const MEDIA_LIBRARY_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MEDIA_LIBRARY_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MEDIA_LIBRARY_ACCEPT = ".jpg,.jpeg,.png,.webp";

export function slugifyMediaValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getExtensionFromFileName(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/i);
  return match?.[1] ?? "";
}

export function getExtensionFromMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "";
  }
}

export function buildMediaLibraryUrl(fileName: string) {
  return `/media/${fileName}`;
}
