import { AppError } from "@/lib/errors/AppError";
import { isAdmin } from "@/lib/auth/admin";
import { IngredientService } from "@/services/ingredient.service";
import { NextResponse } from "next/server";

const ingredientService = new IngredientService();
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type IngredientRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

async function resolveIngredientId(identifier: string) {
  if (UUID_PATTERN.test(identifier)) {
    const ingredientById = await ingredientService.getIngredientById(identifier).catch(() => null);

    if (ingredientById) {
      return ingredientById.id;
    }
  }

  const ingredientBySlug = await ingredientService.getIngredientBySlug(identifier).catch(
    () => null,
  );

  if (ingredientBySlug) {
    return ingredientBySlug.id;
  }

  throw new AppError("Ingredient not found.", "INGREDIENT_NOT_FOUND", 404);
}

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
    const admin = await isAdmin().catch(() => false);
    const ingredient = admin
      ? await ingredientService.getIngredientBySlug(slug)
      : await ingredientService.getPublishedIngredientBySlug(slug);
    const relatedProducts = await ingredientService.getRelatedProductsForIngredient(ingredient.id);

    return NextResponse.json({ ingredient, relatedProducts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: IngredientRouteContext) {
  try {
    const { slug: identifier } = await context.params;
    const payload = await request.json();
    const id = await resolveIngredientId(identifier);
    const ingredient = await ingredientService.updateIngredient(id, payload);

    return NextResponse.json({ ingredient });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: IngredientRouteContext) {
  try {
    const { slug: identifier } = await context.params;
    const id = await resolveIngredientId(identifier);
    await ingredientService.deleteIngredient(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
