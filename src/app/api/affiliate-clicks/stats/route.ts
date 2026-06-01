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

export async function GET() {
  try {
    const stats = await affiliateClickService.getDashboardStats();

    return NextResponse.json({ stats });
  } catch (error) {
    return handleApiError(error);
  }
}
