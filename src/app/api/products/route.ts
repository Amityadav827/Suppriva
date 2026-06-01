import { AppError } from "@/lib/errors/AppError";
import { ProductService } from "@/services/product.service";
import { NextResponse } from "next/server";

const productService = new ProductService();

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

export async function GET() {
  try {
    const products = await productService.getAllProducts();

    return NextResponse.json({ products });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const product = await productService.createProduct(payload);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
