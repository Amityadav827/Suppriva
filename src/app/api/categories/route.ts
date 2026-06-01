import { AppError } from "@/lib/errors/AppError";
import { CategoryService } from "@/services/category.service";
import { NextResponse } from "next/server";

const categoryService = new CategoryService();

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
    const slug = searchParams.get("slug");

    if (slug) {
      const category = await categoryService.getCategoryBySlug(slug);

      return NextResponse.json({ category });
    }

    const categories = await categoryService.getAllCategories();

    return NextResponse.json({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const category = await categoryService.createCategory(payload);

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
