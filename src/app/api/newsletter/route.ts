import { AppError } from "@/lib/errors/AppError";
import { NewsletterService } from "@/services/newsletter.service";
import { NextResponse } from "next/server";

const newsletterService = new NewsletterService();

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
    const email = searchParams.get("email");

    if (email) {
      const subscriber = await newsletterService.getSubscriberByEmail(email);

      return NextResponse.json({ subscriber });
    }

    const subscribers = await newsletterService.getAllSubscribers();

    return NextResponse.json({ subscribers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const subscriber = await newsletterService.createSubscriber(payload);

    return NextResponse.json({ subscriber }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
