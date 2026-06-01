import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}
