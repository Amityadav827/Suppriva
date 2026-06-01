import { AppError } from "@/lib/errors/AppError";
import { CategoryService } from "@/services/category.service";
import { NextResponse } from "next/server";

const categoryService = new CategoryService();

type CategoryRouteContext = {
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

export async function GET(_request: Request, context: CategoryRouteContext) {
  try {
    const { id } = await context.params;
    const category = await categoryService.getCategoryById(id);

    return NextResponse.json({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: CategoryRouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const category = await categoryService.updateCategory(id, payload);

    return NextResponse.json({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: CategoryRouteContext) {
  try {
    const { id } = await context.params;
    await categoryService.deleteCategory(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
