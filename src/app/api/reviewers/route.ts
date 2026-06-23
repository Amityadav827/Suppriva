import { AppError } from "@/lib/errors/AppError";
import { ReviewersService } from "@/services/expert-profiles.service";
import { NextResponse } from "next/server";

const reviewersService = new ReviewersService();

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
    const activeOnly = searchParams.get("active") === "true";
    const reviewers = activeOnly
      ? await reviewersService.getActiveProfiles()
      : await reviewersService.getAllProfiles();

    return NextResponse.json({ reviewers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const reviewer = await reviewersService.createProfile(payload);

    return NextResponse.json({ reviewer }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
