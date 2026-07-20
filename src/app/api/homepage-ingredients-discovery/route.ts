import { AppError } from "@/lib/errors/AppError";
import { HomepageIngredientsDiscoveryService } from "@/services/homepage-ingredients-discovery.service";
import { NextResponse } from "next/server";

const homepageIngredientsDiscoveryService =
  new HomepageIngredientsDiscoveryService();

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
    const ingredientsDiscovery =
      await homepageIngredientsDiscoveryService.safeGetHomepageIngredientsDiscovery();

    return NextResponse.json({ ingredientsDiscovery });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const ingredientsDiscovery =
      await homepageIngredientsDiscoveryService.updateHomepageIngredientsDiscovery(
        payload.ingredientsDiscovery,
      );

    return NextResponse.json({ ingredientsDiscovery });
  } catch (error) {
    return handleApiError(error);
  }
}
