import { AppError } from "@/lib/errors/AppError";
import { ProductService } from "@/services/product.service";
import { NextResponse } from "next/server";

const productService = new ProductService();

type ProductRouteContext = {
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

export async function GET(_request: Request, context: ProductRouteContext) {
  try {
    const { id } = await context.params;
    const product = await productService.getProductById(id);

    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: ProductRouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const product = await productService.updateProduct(id, payload);

    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: ProductRouteContext) {
  try {
    const { id } = await context.params;
    await productService.deleteProduct(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
