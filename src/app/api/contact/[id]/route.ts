import { AppError } from "@/lib/errors/AppError";
import { ContactMessagesService } from "@/services/contact.service";
import { NextResponse } from "next/server";

const contactMessagesService = new ContactMessagesService();

type ContactMessageRouteContext = {
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

export async function DELETE(_request: Request, context: ContactMessageRouteContext) {
  try {
    const { id } = await context.params;
    await contactMessagesService.deleteMessage(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
