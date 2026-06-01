import { AppError } from "@/lib/errors/AppError";
import { ContactMessagesService } from "@/services/contact.service";
import { NextResponse } from "next/server";

const contactMessagesService = new ContactMessagesService();

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
    const messages = await contactMessagesService.getAllMessages();

    return NextResponse.json({ messages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const message = await contactMessagesService.createMessage(payload);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
