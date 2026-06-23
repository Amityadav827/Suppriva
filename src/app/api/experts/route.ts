import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin";
import { AppError } from "@/lib/errors/AppError";
import { ExpertsService } from "@/services/experts.service";

const expertsService = new ExpertsService();

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
    const activeOnly = searchParams.get("active") === "true";
    const featuredOnly = searchParams.get("featured") === "true";

    if (!activeOnly && !featuredOnly && !(await isAdmin())) {
      return NextResponse.json(
        { error: "Admin access required.", code: "FORBIDDEN" },
        { status: 403 },
      );
    }

    const experts = featuredOnly
      ? await expertsService.getFeaturedExperts()
      : activeOnly
        ? await expertsService.getActiveExperts()
        : await expertsService.getAllExperts();

    return NextResponse.json({ experts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const expert = await expertsService.createExpert(payload);

    return NextResponse.json({ expert }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
