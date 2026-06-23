import { AppError } from "@/lib/errors/AppError";
import { ReviewersService } from "@/services/expert-profiles.service";
import { NextResponse } from "next/server";

const reviewersService = new ReviewersService();

type ReviewerRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function GET(_request: Request, context: ReviewerRouteContext) {
  try {
    const { id } = await context.params;
    const reviewer = await reviewersService.getProfileById(id);

    return NextResponse.json({ reviewer });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: ReviewerRouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const reviewer = await reviewersService.updateProfile(id, payload);

    return NextResponse.json({ reviewer });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: ReviewerRouteContext) {
  try {
    const { id } = await context.params;
    await reviewersService.deleteProfile(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
