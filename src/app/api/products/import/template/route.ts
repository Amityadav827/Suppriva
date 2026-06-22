import { isAdmin } from "@/lib/auth/admin";
import { AppError } from "@/lib/errors/AppError";
import { buildProductImportTemplate } from "@/lib/products/import-csv";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { NextResponse } from "next/server";

const categoryService = new CategoryService();
const ingredientService = new IngredientService();

export async function GET() {
  try {
    const allowed = await isAdmin();

    if (!allowed) {
      throw new AppError("Admin access is required.", "ADMIN_REQUIRED", 403);
    }

    const [categories, ingredients] = await Promise.all([
      categoryService.getAllCategories(),
      ingredientService.getAllIngredients(),
    ]);
    const template = buildProductImportTemplate({
      sampleCategories: categories.map((category) => category.title),
      sampleIngredients: ingredients.map((ingredient) => ingredient.name),
    });

    return new Response(template, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="suppriva-product-import-template.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
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
}
