import { AppError } from "@/lib/errors/AppError";
import { BlogService } from "@/services/blog.service";
import { NextResponse } from "next/server";

const blogService = new BlogService();

type BlogRouteContext = {
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

export async function GET(_request: Request, context: BlogRouteContext) {
  try {
    const { id } = await context.params;
    const blog = await blogService.getBlogById(id);

    return NextResponse.json({ blog });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: BlogRouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const blog = await blogService.updateBlog(id, payload);

    return NextResponse.json({ blog });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: BlogRouteContext) {
  try {
    const { id } = await context.params;
    await blogService.deleteBlog(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
