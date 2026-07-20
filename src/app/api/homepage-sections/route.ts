import { AppError } from "@/lib/errors/AppError";
import { HomepageSectionsService } from "@/services/homepage-sections.service";
import { NextResponse } from "next/server";

const homepageSectionsService = new HomepageSectionsService();

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

export async function GET() {
  try {
    const sections = await homepageSectionsService.safeGetHomepageSections();

    return NextResponse.json({ sections });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const sections = await homepageSectionsService.updateHomepageSections(payload);

    return NextResponse.json({ sections });
  } catch (error) {
    return handleApiError(error);
  }
}
