import { AppError } from "@/lib/errors/AppError";
import type { IngredientCsvRow } from "@/lib/ingredients/csv";
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

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      rows?: Array<{
        rowNumber: number;
        row: Record<string, string>;
      }>;
    };

    const result = await ingredientService.importIngredients(
      (payload.rows ?? []).map((entry) => ({
        rowNumber: entry.rowNumber,
        row: entry.row as IngredientCsvRow,
      })),
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
