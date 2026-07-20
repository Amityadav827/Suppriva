import { AppError } from "@/lib/errors/AppError";
import { HomepageTrustBadgesService } from "@/services/homepage-trust-badges.service";
import { NextResponse } from "next/server";

const homepageTrustBadgesService = new HomepageTrustBadgesService();

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
    const trustBadges =
      await homepageTrustBadgesService.safeGetHomepageTrustBadges();

    return NextResponse.json({ trustBadges });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const trustBadges =
      await homepageTrustBadgesService.updateHomepageTrustBadges(
        payload.trustBadges,
      );

    return NextResponse.json({ trustBadges });
  } catch (error) {
    return handleApiError(error);
  }
}
