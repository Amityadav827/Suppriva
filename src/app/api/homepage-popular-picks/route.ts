import { AppError } from "@/lib/errors/AppError";
import { HomepagePopularPicksService } from "@/services/homepage-popular-picks.service";
import { NextResponse } from "next/server";

const homepagePopularPicksService = new HomepagePopularPicksService();

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
    const popularPicks =
      await homepagePopularPicksService.safeGetHomepagePopularPicks();

    return NextResponse.json({ popularPicks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const popularPicks =
      await homepagePopularPicksService.updateHomepagePopularPicks(
        payload.popularPicks,
      );

    return NextResponse.json({ popularPicks });
  } catch (error) {
    return handleApiError(error);
  }
}
