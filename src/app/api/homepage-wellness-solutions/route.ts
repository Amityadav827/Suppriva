import { AppError } from "@/lib/errors/AppError";
import { HomepageWellnessSolutionsService } from "@/services/homepage-wellness-solutions.service";
import { NextResponse } from "next/server";

const homepageWellnessSolutionsService = new HomepageWellnessSolutionsService();

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
    const wellnessSolutions =
      await homepageWellnessSolutionsService.safeGetHomepageWellnessSolutions();

    return NextResponse.json({ wellnessSolutions });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const wellnessSolutions =
      await homepageWellnessSolutionsService.updateHomepageWellnessSolutions(
        payload.wellnessSolutions,
      );

    return NextResponse.json({ wellnessSolutions });
  } catch (error) {
    return handleApiError(error);
  }
}
