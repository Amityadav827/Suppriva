import { AppError } from "@/lib/errors/AppError";
import { SeoService } from "@/services/seo.service";
import { NextResponse } from "next/server";

const seoService = new SeoService();

type SeoRouteContext = {
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

export async function GET(_request: Request, context: SeoRouteContext) {
  try {
    const { id } = await context.params;
    const seo = await seoService.getSeoById(id);

    return NextResponse.json({ seo });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: SeoRouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const seo = await seoService.updateSeo(id, payload);

    return NextResponse.json({ seo });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: SeoRouteContext) {
  try {
    const { id } = await context.params;
    await seoService.deleteSeo(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
