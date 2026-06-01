import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { isAdmin } from "@/lib/auth/admin";
import {
  type ContactMessageCreateInput,
  validateContactMessageInput,
} from "@/lib/validators/contact.validator";
import { ContactMessagesRepository } from "@/repositories/contact.repository";

export class ContactMessagesService {
  constructor(
    private readonly contactMessagesRepository = new ContactMessagesRepository(),
  ) {}

  async getAllMessages() {
    await this.assertAdmin();

    return this.contactMessagesRepository.getAllMessages();
  }

  async createMessage(input: ContactMessageCreateInput) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateContactMessageInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    return this.contactMessagesRepository.createMessage(normalizedInput);
  }

  async deleteMessage(id: string) {
    await this.assertAdmin();

    if (!id?.trim()) {
      throw new ValidationError("Message ID is required.");
    }

    await this.contactMessagesRepository.deleteMessage(id);
  }

  private normalizeInput(input: ContactMessageCreateInput): ContactMessageCreateInput {
    return {
      name: input.name?.trim() ?? "",
      email: input.email?.trim().toLowerCase() ?? "",
      subject: input.subject?.trim() ?? "",
      message: input.message?.trim() ?? "",
    };
  }

  private async assertAdmin() {
    if (!(await isAdmin())) {
      throw new AppError("Admin access is required.", "ADMIN_REQUIRED", 403);
    }
  }
}
