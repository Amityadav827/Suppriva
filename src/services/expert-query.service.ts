import { isAdmin } from "@/lib/auth/admin";
import { notifyExpertQueryAdmin } from "@/lib/notifications/expert-query";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type ExpertQueryCreateInput,
  type ExpertQueryUpdateInput,
  validateExpertQueryInput,
  validateExpertQueryStatusUpdate,
} from "@/lib/validators/expert-query.validator";
import { ExpertQueryRepository } from "@/repositories/expert-query.repository";

export class ExpertQueryService {
  constructor(private readonly expertQueryRepository = new ExpertQueryRepository()) {}

  async getAllQueries() {
    await this.assertAdmin();

    return this.expertQueryRepository.getAllQueries();
  }

  async createQuery(input: ExpertQueryCreateInput) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateExpertQueryInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const query = await this.expertQueryRepository.createQuery(normalizedInput);
    const notification = await notifyExpertQueryAdmin(query).catch((error) => ({
      delivered: false,
      reason: error instanceof Error ? error.message : "Notification failed.",
    }));

    return {
      query,
      notification,
    };
  }

  async updateQueryStatus(id: string, input: ExpertQueryUpdateInput) {
    await this.assertAdmin();

    if (!id?.trim()) {
      throw new ValidationError("Query ID is required.");
    }

    const normalizedInput = {
      status: input.status?.trim().toLowerCase() as ExpertQueryUpdateInput["status"],
    };
    const validation = validateExpertQueryStatusUpdate(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    return this.expertQueryRepository.updateQueryStatus(id.trim(), normalizedInput);
  }

  async deleteQuery(id: string) {
    await this.assertAdmin();

    if (!id?.trim()) {
      throw new ValidationError("Query ID is required.");
    }

    await this.expertQueryRepository.deleteQuery(id.trim());
  }

  private normalizeInput(input: ExpertQueryCreateInput): ExpertQueryCreateInput {
    return {
      name: input.name?.trim() ?? "",
      email: input.email?.trim().toLowerCase() ?? "",
      category: input.category?.trim() ?? "",
      expert_id: input.expert_id?.trim() ?? "",
      product_name: input.product_name?.trim() ?? "",
      product_url: input.product_url?.trim() ?? "",
      question_type: input.question_type?.trim() ?? "",
      message: input.message?.trim() ?? "",
      source_page: input.source_page?.trim() ?? "",
    };
  }

  private async assertAdmin() {
    if (!(await isAdmin())) {
      throw new AppError("Admin access is required.", "ADMIN_REQUIRED", 403);
    }
  }
}
