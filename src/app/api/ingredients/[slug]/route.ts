import { AppError } from "@/lib/errors/AppError";
import { IngredientService } from "@/services/ingredient.service";
import { NextResponse } from "next/server";

const ingredientService = new IngredientService();

type IngredientRouteContext = {
  params: Promise<{
    slug: string;
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

export async function GET(_request: Request, context: IngredientRouteContext) {
  try {
    const { slug } = await context.params;
    const ingredient = await ingredientService.getIngredientBySlug(slug);
    const relatedProducts = await ingredientService.getRelatedProductsForIngredient(ingredient.id);

    return NextResponse.json({ ingredient, relatedProducts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: IngredientRouteContext) {
  try {
    const { slug: id } = await context.params;
    const payload = await request.json();
    const ingredient = await ingredientService.updateIngredient(id, payload);

    return NextResponse.json({ ingredient });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: IngredientRouteContext) {
  try {
    const { slug: id } = await context.params;
    await ingredientService.deleteIngredient(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
