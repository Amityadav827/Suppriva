import { SubscriberStatus } from "@/lib/database/constants";
import { AppError } from "@/lib/errors/AppError";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type NewsletterSubscribeInput,
  type NewsletterUnsubscribeInput,
  validateNewsletterSubscribeInput,
  validateNewsletterUnsubscribeInput,
} from "@/lib/validators/newsletter.validator";
import { NewsletterRepository } from "@/repositories/newsletter.repository";

export class NewsletterService {
  constructor(private readonly newsletterRepository = new NewsletterRepository()) {}

  async getAllSubscribers() {
    return this.newsletterRepository.getAllSubscribers();
  }

  async getSubscriberByEmail(email: string) {
    return this.newsletterRepository.getSubscriberByEmail(email.toLowerCase().trim());
  }

  async createSubscriber(input: NewsletterSubscribeInput) {
    const normalizedInput = this.normalizeSubscribeInput(input);
    const validation = validateNewsletterSubscribeInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    try {
      return await this.newsletterRepository.createSubscriber(normalizedInput);
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        error.message.toLowerCase().includes("duplicate")
      ) {
        throw new ValidationError("This email is already subscribed.");
      }

      throw error;
    }
  }

  async unsubscribeSubscriber(input: NewsletterUnsubscribeInput) {
    const normalizedInput = {
      email: input.email.toLowerCase().trim(),
    };
    const validation = validateNewsletterUnsubscribeInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    try {
      return await this.newsletterRepository.unsubscribeSubscriber(normalizedInput.email);
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        error.message.toLowerCase().includes("not found")
      ) {
        throw new AppError("Subscriber not found.", "SUBSCRIBER_NOT_FOUND", 404);
      }

      throw error;
    }
  }

  async deleteSubscriber(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const existingSubscriber = await this.newsletterRepository.getSubscriberByEmail(
      normalizedEmail,
    );

    if (!existingSubscriber) {
      throw new AppError("Subscriber not found.", "SUBSCRIBER_NOT_FOUND", 404);
    }

    await this.newsletterRepository.deleteSubscriber(normalizedEmail);
  }

  async getSubscriberStats() {
    return this.newsletterRepository.getSubscriberStats();
  }

  private normalizeSubscribeInput(input: NewsletterSubscribeInput): NewsletterSubscribeInput {
    return {
      email: input.email.toLowerCase().trim(),
      status: input.status ?? SubscriberStatus.Active,
      source_page: input.source_page ?? null,
    };
  }
}
