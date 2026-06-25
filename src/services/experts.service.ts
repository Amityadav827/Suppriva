import { isAdmin } from "@/lib/auth/admin";
import type { Expert } from "@/lib/database/types";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type ExpertCreateInput,
  type ExpertUpdateInput,
  validateExpertInput,
} from "@/lib/validators/expert.validator";
import {
  SupabaseExpertsRepository,
  type ExpertsRepository,
} from "@/repositories/experts.repository";
import { AuthorsService, ReviewersService } from "@/services/expert-profiles.service";

export class ExpertsService {
  private readonly authorsService = new AuthorsService();
  private readonly reviewersService = new ReviewersService();

  constructor(private readonly expertsRepository: ExpertsRepository = new SupabaseExpertsRepository()) {}

  get repository() {
    return this.expertsRepository;
  }

  async getAllExperts() {
    return this.expertsRepository.getAllExperts();
  }

  async getActiveExperts() {
    return this.expertsRepository.getActiveExperts();
  }

  async getFeaturedExperts() {
    return this.expertsRepository.getFeaturedExperts();
  }

  async getExpertById(id: string) {
    const expert = await this.expertsRepository.getExpertById(id);

    if (!expert) {
      throw new AppError("Expert not found.", "EXPERT_NOT_FOUND", 404);
    }

    return expert;
  }

  async getExpertBySlug(slug: string) {
    const expert = await this.expertsRepository.getExpertBySlug(slug);

    if (!expert) {
      throw new AppError("Expert not found.", "EXPERT_NOT_FOUND", 404);
    }

    return expert;
  }

  async createExpert(input: ExpertCreateInput) {
    await this.ensureAdminAccess();
    const normalizedInput = await this.normalizeCreateInput(input);
    this.assertValid(normalizedInput, "create");
    await this.assertUniqueSlug(normalizedInput.slug);

    return this.expertsRepository.createExpert(normalizedInput);
  }

  async updateExpert(id: string, input: ExpertUpdateInput) {
    await this.ensureAdminAccess();
    await this.getExpertById(id);
    const normalizedInput = await this.normalizeUpdateInput(input);
    this.assertValid(normalizedInput, "update");

    if (normalizedInput.slug) {
      await this.assertUniqueSlug(normalizedInput.slug, id);
    }

    return this.expertsRepository.updateExpert(id, normalizedInput);
  }

  async deleteExpert(id: string) {
    await this.ensureAdminAccess();
    await this.getExpertById(id);
    await this.expertsRepository.deleteExpert(id);
  }

  async safeGetActiveExperts() {
    try {
      return await this.getActiveExperts();
    } catch {
      return [] as Expert[];
    }
  }

  async safeGetFeaturedExperts() {
    try {
      return await this.getFeaturedExperts();
    } catch {
      return [] as Expert[];
    }
  }

  private async normalizeCreateInput(input: ExpertCreateInput): Promise<ExpertCreateInput> {
    const name = input.name.trim();
    const slug = input.slug?.trim() || this.createSlug(name);

    return {
      ...input,
      name,
      slug,
      profile_image: input.profile_image?.trim() || null,
      designation: input.designation?.trim() || null,
      short_bio: input.short_bio?.trim() || null,
      full_bio: input.full_bio?.trim() || null,
      editorial_contribution: input.editorial_contribution?.trim() || null,
      content_reviewed: this.normalizeContentReviewed(input.content_reviewed),
      linkedin_url: input.linkedin_url?.trim() || null,
      website_url: input.website_url?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      expertise_tags: this.normalizeTags(input.expertise_tags),
      status: input.status ?? "active",
      display_order: input.display_order ?? 0,
      featured_on_homepage: input.featured_on_homepage ?? false,
      seo_title: input.seo_title?.trim() || null,
      seo_description: input.seo_description?.trim() || null,
      meta_image: input.meta_image?.trim() || null,
      linked_author_id: await this.normalizeAuthorId(input.linked_author_id),
      linked_reviewer_id: await this.normalizeReviewerId(input.linked_reviewer_id),
    };
  }

  private async normalizeUpdateInput(input: ExpertUpdateInput): Promise<ExpertUpdateInput> {
    const normalizedInput: ExpertUpdateInput = { ...input };

    if ("name" in input && input.name !== undefined) {
      normalizedInput.name = input.name.trim();
    }
    if ("slug" in input) {
      normalizedInput.slug = input.slug?.trim() || undefined;
    }
    if ("profile_image" in input) normalizedInput.profile_image = input.profile_image?.trim() || null;
    if ("designation" in input) normalizedInput.designation = input.designation?.trim() || null;
    if ("short_bio" in input) normalizedInput.short_bio = input.short_bio?.trim() || null;
    if ("full_bio" in input) normalizedInput.full_bio = input.full_bio?.trim() || null;
    if ("editorial_contribution" in input) {
      normalizedInput.editorial_contribution = input.editorial_contribution?.trim() || null;
    }
    if ("content_reviewed" in input) {
      normalizedInput.content_reviewed = this.normalizeContentReviewed(input.content_reviewed);
    }
    if ("linkedin_url" in input) normalizedInput.linkedin_url = input.linkedin_url?.trim() || null;
    if ("website_url" in input) normalizedInput.website_url = input.website_url?.trim() || null;
    if ("email" in input) normalizedInput.email = input.email?.trim().toLowerCase() || null;
    if ("expertise_tags" in input) normalizedInput.expertise_tags = this.normalizeTags(input.expertise_tags);
    if ("seo_title" in input) normalizedInput.seo_title = input.seo_title?.trim() || null;
    if ("seo_description" in input) {
      normalizedInput.seo_description = input.seo_description?.trim() || null;
    }
    if ("meta_image" in input) normalizedInput.meta_image = input.meta_image?.trim() || null;
    if ("linked_author_id" in input) {
      normalizedInput.linked_author_id = await this.normalizeAuthorId(input.linked_author_id);
    }
    if ("linked_reviewer_id" in input) {
      normalizedInput.linked_reviewer_id = await this.normalizeReviewerId(input.linked_reviewer_id);
    }

    return normalizedInput;
  }

  private normalizeTags(tags?: string[] | null) {
    return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
  }

  private normalizeContentReviewed(
    items?: ExpertCreateInput["content_reviewed"],
  ): NonNullable<ExpertCreateInput["content_reviewed"]> {
    return (items ?? [])
      .map((item) => ({
        label: item.label.trim(),
        value: Math.max(0, Math.trunc(Number(item.value) || 0)),
        description: item.description?.trim() || null,
      }))
      .filter((item) => item.label);
  }

  private async normalizeAuthorId(id?: string | null) {
    if (!id) {
      return null;
    }

    const author = await this.authorsService.assertProfileExists(id);
    return author.id;
  }

  private async normalizeReviewerId(id?: string | null) {
    if (!id) {
      return null;
    }

    const reviewer = await this.reviewersService.assertProfileExists(id);
    return reviewer.id;
  }

  private async assertUniqueSlug(slug?: string, currentId?: string) {
    if (!slug) {
      throw new ValidationError("Expert slug is required.");
    }

    const existingExpert = await this.expertsRepository.getExpertBySlug(slug);

    if (existingExpert && existingExpert.id !== currentId) {
      throw new ValidationError("An expert with this slug already exists.");
    }
  }

  private assertValid(input: ExpertCreateInput | ExpertUpdateInput, mode: "create" | "update") {
    const result = validateExpertInput(input, mode);

    if (!result.success) {
      throw new ValidationError(result.errors.join(" "));
    }
  }

  private createSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private async ensureAdminAccess() {
    const allowed = await isAdmin();

    if (!allowed) {
      throw new AppError("Admin access required.", "FORBIDDEN", 403);
    }
  }
}
