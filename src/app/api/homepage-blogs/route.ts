import { AppError } from "@/lib/errors/AppError";
import { HomepageBlogsService } from "@/services/homepage-blogs.service";
import { NextResponse } from "next/server";

const homepageBlogsService = new HomepageBlogsService();

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
    const homepageBlogs = await homepageBlogsService.safeGetHomepageBlogs();

    return NextResponse.json({ homepageBlogs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const homepageBlogs = await homepageBlogsService.updateHomepageBlogs(
      payload.homepageBlogs,
    );

    return NextResponse.json({ homepageBlogs });
  } catch (error) {
    return handleApiError(error);
  }
}
