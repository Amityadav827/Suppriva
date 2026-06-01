import { SubscriberStatus } from "@/lib/database/constants";

export type NewsletterSubscribeInput = {
  email: string;
  status?: SubscriberStatus;
  source_page?: string | null;
};

export type NewsletterUnsubscribeInput = {
  email: string;
};

export type NewsletterValidationResult<TInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateNewsletterSubscribeInput<TInput extends NewsletterSubscribeInput>(
  input: TInput,
): NewsletterValidationResult<TInput> {
  const errors: string[] = [];

  if (!input.email?.trim()) {
    errors.push("Email is required.");
  }

  if (input.email && !EMAIL_PATTERN.test(input.email)) {
    errors.push("Email must be valid.");
  }

  if (
    input.status &&
    !Object.values(SubscriberStatus).includes(input.status)
  ) {
    errors.push("Subscriber status is invalid.");
  }

  if (
    input.source_page !== undefined &&
    input.source_page !== null &&
    input.source_page.length > 300
  ) {
    errors.push("Source page must be 300 characters or fewer.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}

export function validateNewsletterUnsubscribeInput<TInput extends NewsletterUnsubscribeInput>(
  input: TInput,
): NewsletterValidationResult<TInput> {
  const errors: string[] = [];

  if (!input.email?.trim()) {
    errors.push("Email is required.");
  }

  if (input.email && !EMAIL_PATTERN.test(input.email)) {
    errors.push("Email must be valid.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}
