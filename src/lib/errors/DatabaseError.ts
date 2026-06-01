import { AppError } from "./AppError";

export class DatabaseError extends AppError {
  constructor(message = "A database error occurred") {
    super(message, "DATABASE_ERROR", 500);
    this.name = "DatabaseError";
  }
}
