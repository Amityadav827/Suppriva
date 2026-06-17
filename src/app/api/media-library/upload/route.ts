import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import { MediaLibraryService } from "@/services/media-library.service";

const mediaLibraryService = new MediaLibraryService();

function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";

  return NextResponse.json(
    { error: message, code: "UNEXPECTED_ERROR" },
    { status: 500 },
  );
}

function parseNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required.", code: "FILE_REQUIRED" },
        { status: 400 },
      );
    }

    const item = await mediaLibraryService.uploadMediaFile({
      originalFileName: file.name,
      title: typeof formData.get("title") === "string" ? String(formData.get("title")) : null,
      alt_text:
        typeof formData.get("alt_text") === "string" ? String(formData.get("alt_text")) : null,
      caption:
        typeof formData.get("caption") === "string" ? String(formData.get("caption")) : null,
      description:
        typeof formData.get("description") === "string"
          ? String(formData.get("description"))
          : null,
      tags: parseTags(formData.get("tags")),
      mime_type: file.type,
      file_size: file.size,
      width: parseNumber(formData.get("width")),
      height: parseNumber(formData.get("height")),
      fileBuffer: await file.arrayBuffer(),
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
