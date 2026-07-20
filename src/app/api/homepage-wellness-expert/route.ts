import { AppError } from "@/lib/errors/AppError";
import { HomepageWellnessExpertService } from "@/services/homepage-wellness-expert.service";
import { NextResponse } from "next/server";

const homepageWellnessExpertService = new HomepageWellnessExpertService();

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
    const wellnessExpert =
      await homepageWellnessExpertService.safeGetHomepageWellnessExpert();

    return NextResponse.json({ wellnessExpert });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const wellnessExpert =
      await homepageWellnessExpertService.updateHomepageWellnessExpert(
        payload.wellnessExpert,
      );

    return NextResponse.json({ wellnessExpert });
  } catch (error) {
    return handleApiError(error);
  }
}
