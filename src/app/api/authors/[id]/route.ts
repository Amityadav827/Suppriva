import { AppError } from "@/lib/errors/AppError";
import { AuthorsService } from "@/services/expert-profiles.service";
import { NextResponse } from "next/server";

const authorsService = new AuthorsService();

type AuthorRouteContext = {
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

export async function GET(_request: Request, context: AuthorRouteContext) {
  try {
    const { id } = await context.params;
    const author = await authorsService.getProfileById(id);

    return NextResponse.json({ author });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: AuthorRouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const author = await authorsService.updateProfile(id, payload);

    return NextResponse.json({ author });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: AuthorRouteContext) {
  try {
    const { id } = await context.params;
    await authorsService.deleteProfile(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
