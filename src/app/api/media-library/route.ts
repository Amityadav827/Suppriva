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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const items = await mediaLibraryService.listMedia({
      query: searchParams.get("q") ?? undefined,
      mimeType: searchParams.get("mime") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
    });

    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
