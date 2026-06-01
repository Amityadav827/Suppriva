export type ContactMessageCreateInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactMessageValidationResult<TInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactMessageInput<TInput extends ContactMessageCreateInput>(
  input: TInput,
): ContactMessageValidationResult<TInput> {
  const errors: string[] = [];

  if (!input.name?.trim()) {
    errors.push("Name is required.");
  }

  if (!input.email?.trim()) {
    errors.push("Email is required.");
  } else if (!EMAIL_PATTERN.test(input.email)) {
    errors.push("Email must be valid.");
  }

  if (!input.subject?.trim()) {
    errors.push("Subject is required.");
  }

  if (!input.message?.trim()) {
    errors.push("Message is required.");
  }

  if (input.name?.trim().length > 120) {
    errors.push("Name must be 120 characters or fewer.");
  }

  if (input.email?.trim().length > 180) {
    errors.push("Email must be 180 characters or fewer.");
  }

  if (input.subject?.trim().length > 180) {
    errors.push("Subject must be 180 characters or fewer.");
  }

  if (input.message?.trim().length > 4000) {
    errors.push("Message must be 4000 characters or fewer.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}
