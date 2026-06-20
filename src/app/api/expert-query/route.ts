import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import { ExpertQueryService } from "@/services/expert-query.service";

const expertQueryService = new ExpertQueryService();

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
    const queries = await expertQueryService.getAllQueries();

    return NextResponse.json({ queries });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await expertQueryService.createQuery(payload);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
