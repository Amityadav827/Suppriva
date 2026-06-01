import { PageType } from "@/lib/database/constants";
import { AppError } from "@/lib/errors/AppError";
import { SeoService } from "@/services/seo.service";
import { NextResponse } from "next/server";

const seoService = new SeoService();

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
    const pageType = searchParams.get("page_type") as PageType | null;
    const pageSlug = searchParams.get("page_slug");

    if (pageType && pageSlug) {
      const seo = await seoService.getSeoByPage(pageType, pageSlug);

      return NextResponse.json({ seo });
    }

    const seoRecords = await seoService.getAllSeo();

    return NextResponse.json({ seoRecords });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const seo = await seoService.createSeo(payload);

    return NextResponse.json({ seo }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
