import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import { DashboardAnalyticsService } from "@/services/dashboard-analytics.service";

const dashboardAnalyticsService = new DashboardAnalyticsService();

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
    const overview = await dashboardAnalyticsService.getOverview();

    return NextResponse.json({ overview });
  } catch (error) {
    return handleApiError(error);
  }
}
