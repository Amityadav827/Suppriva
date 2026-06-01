import { AppError } from "@/lib/errors/AppError";
import { BlogService } from "@/services/blog.service";
import { NextResponse } from "next/server";

const blogService = new BlogService();

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
    const slug = searchParams.get("slug");

    if (slug) {
      const blog = await blogService.getBlogBySlug(slug);

      return NextResponse.json({ blog });
    }

    const blogs = await blogService.getAllBlogs();

    return NextResponse.json({ blogs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const blog = await blogService.createBlog(payload);

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
