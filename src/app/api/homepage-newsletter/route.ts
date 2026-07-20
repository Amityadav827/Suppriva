import { NextRequest, NextResponse } from "next/server";
import { HomepageNewsletterService } from "@/services/homepage-newsletter.service";

const homepageNewsletterService = new HomepageNewsletterService();

export async function GET() {
  try {
    const newsletter =
      await homepageNewsletterService.safeGetHomepageNewsletter();

    return NextResponse.json({ newsletter });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load Homepage Newsletter CMS.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      newsletter?: Parameters<
        HomepageNewsletterService["updateHomepageNewsletter"]
      >[0];
    };

    if (!payload.newsletter) {
      return NextResponse.json(
        { error: "Homepage Newsletter CMS payload is required." },
        { status: 400 },
      );
    }

    const newsletter = await homepageNewsletterService.updateHomepageNewsletter(
      payload.newsletter,
    );

    return NextResponse.json({ newsletter });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save Homepage Newsletter CMS.",
      },
      { status: 400 },
    );
  }
}
