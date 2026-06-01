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

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const userAgent = request.headers.get("user-agent");
    const referrer = request.headers.get("referer");
    const country =
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      null;

    const click = await affiliateClickService.createClick({
      ...payload,
      user_agent: payload.user_agent ?? userAgent,
      referrer: payload.referrer ?? referrer,
      country: payload.country ?? country,
    });

    return NextResponse.json({ click }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
