import { AppError } from "@/lib/errors/AppError";
import { isAdmin } from "@/lib/auth/admin";
import { IngredientService } from "@/services/ingredient.service";
import { NextResponse } from "next/server";

const ingredientService = new IngredientService();

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
    const query = searchParams.get("q");
    const featured = searchParams.get("featured");
    const admin = await isAdmin().catch(() => false);

    if (featured === "true") {
      const ingredients = await ingredientService.getFeaturedIngredients();

      return NextResponse.json({ ingredients, total: ingredients.length });
    }

    if (query) {
      const ingredients = admin
        ? await ingredientService.searchIngredients(query)
        : await ingredientService.searchPublishedIngredients(query);

      return NextResponse.json({ ingredients, total: ingredients.length });
    }

    const ingredients = admin
      ? await ingredientService.getAllIngredients()
      : await ingredientService.getPublishedIngredients();

    return NextResponse.json({ ingredients, total: ingredients.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const ingredient = await ingredientService.createIngredient(payload);

    return NextResponse.json({ ingredient }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
