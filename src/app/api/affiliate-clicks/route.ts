import { AppError } from "@/lib/errors/AppError";
import { AffiliateClickService } from "@/services/affiliate-click.service";
import { NextResponse } from "next/server";

const affiliateClickService = new AffiliateClickService();

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
    const productId = searchParams.get("product_id");
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    if (productId) {
      const clicks = await affiliateClickService.getClicksByProduct(productId);

      return NextResponse.json({ clicks });
    }

    if (startDate && endDate) {
      const clicks = await affiliateClickService.getClicksByDateRange(startDate, endDate);

      return NextResponse.json({ clicks });
    }

    const clicks = await affiliateClickService.getAllClicks();

    return NextResponse.json({ clicks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const click = await affiliateClickService.createClick(payload);

    return NextResponse.json({ click }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
