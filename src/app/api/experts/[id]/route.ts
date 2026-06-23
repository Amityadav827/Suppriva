import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin";
import { AppError } from "@/lib/errors/AppError";
import { ExpertsService } from "@/services/experts.service";

const expertsService = new ExpertsService();

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Admin access required.", code: "FORBIDDEN" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const expert = await expertsService.getExpertById(id);

    return NextResponse.json({ expert });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const expert = await expertsService.updateExpert(id, payload);

    return NextResponse.json({ expert });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await expertsService.deleteExpert(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
