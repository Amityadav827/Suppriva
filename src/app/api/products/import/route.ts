import { isAdmin } from "@/lib/auth/admin";
import { AppError } from "@/lib/errors/AppError";
import type { ParsedProductImportRow, ProductImportCsvRow } from "@/lib/products/import-csv";
import { ProductImportService } from "@/services/product-import.service";
import { NextResponse } from "next/server";

const productImportService = new ProductImportService();

type ProductImportRequestPayload = {
  mode?: "validate" | "import";
  filename?: string;
  rows?: Array<{
    rowNumber: number;
    row: ProductImportCsvRow;
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

function toParsedRows(payload: ProductImportRequestPayload): ParsedProductImportRow[] {
  return (payload.rows ?? []).map((entry) => ({
    rowNumber: entry.rowNumber,
    row: entry.row,
  }));
}

export async function POST(request: Request) {
  try {
    const allowed = await isAdmin();

    if (!allowed) {
      throw new AppError("Admin access is required.", "ADMIN_REQUIRED", 403);
    }

    const payload = (await request.json()) as ProductImportRequestPayload;
    const rows = toParsedRows(payload);

    if (payload.mode === "import") {
      const result = await productImportService.importRows(
        payload.filename?.trim() || "bulk-product-import.csv",
        rows,
      );

      return NextResponse.json(result);
    }

    const preview = await productImportService.previewImport(rows);

    return NextResponse.json(preview);
  } catch (error) {
    return handleApiError(error);
  }
}
