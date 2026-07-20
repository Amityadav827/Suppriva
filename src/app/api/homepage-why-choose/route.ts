import { AppError } from "@/lib/errors/AppError";
import { HomepageWhyChooseService } from "@/services/homepage-why-choose.service";
import { NextResponse } from "next/server";

const homepageWhyChooseService = new HomepageWhyChooseService();

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
    const whyChoose = await homepageWhyChooseService.safeGetHomepageWhyChoose();

    return NextResponse.json({ whyChoose });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const whyChoose = await homepageWhyChooseService.updateHomepageWhyChoose(
      payload.whyChoose,
    );

    return NextResponse.json({ whyChoose });
  } catch (error) {
    return handleApiError(error);
  }
}
