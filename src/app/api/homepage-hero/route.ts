import { AppError } from "@/lib/errors/AppError";
import { HomepageHeroService } from "@/services/homepage-hero.service";
import { NextResponse } from "next/server";

const homepageHeroService = new HomepageHeroService();

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
    const hero = await homepageHeroService.safeGetHomepageHero();

    return NextResponse.json({ hero });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const hero = await homepageHeroService.updateHomepageHero(payload.hero);

    return NextResponse.json({ hero });
  } catch (error) {
    return handleApiError(error);
  }
}
