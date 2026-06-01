import { PageType } from "@/lib/database/constants";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type SeoCreateInput,
  type SeoUpdateInput,
  validateSeoInput,
} from "@/lib/validators/seo.validator";
import {
  SupabaseSeoRepository,
  type SeoRepository,
} from "@/repositories/seo.repository";

export class SeoService {
  constructor(private readonly seoRepository: SeoRepository = new SupabaseSeoRepository()) {}

  get repository() {
    return this.seoRepository;
  }

  async getAllSeo() {
    return this.seoRepository.getAllSeo();
  }

  async getSeoById(id: string) {
    const seo = await this.seoRepository.getSeoById(id);

    if (!seo) {
      throw new AppError("SEO record not found.", "SEO_NOT_FOUND", 404);
    }

    return seo;
  }

  async getSeoByPage(pageType: PageType, pageSlug: string) {
    return this.seoRepository.getSeoByPage(pageType, pageSlug);
  }

  async createSeo(input: SeoCreateInput) {
    const normalizedInput = this.normalizeCreateInput(input);
    this.assertValid(normalizedInput, "create");
    await this.assertUniquePage(normalizedInput.page_type, normalizedInput.page_slug);

    return this.seoRepository.createSeo(normalizedInput);
  }

  async updateSeo(id: string, input: SeoUpdateInput) {
    const existingSeo = await this.getSeoById(id);
    const normalizedInput = this.normalizeUpdateInput(input);
    this.assertValid(normalizedInput, "update");

    if (normalizedInput.page_type || normalizedInput.page_slug) {
      await this.assertUniquePage(
        normalizedInput.page_type ?? existingSeo.page_type,
        normalizedInput.page_slug ?? existingSeo.page_slug ?? "",
        id,
      );
    }

    return this.seoRepository.updateSeo(id, normalizedInput);
  }

  async deleteSeo(id: string) {
    await this.getSeoById(id);
    await this.seoRepository.deleteSeo(id);
  }

  private normalizeCreateInput(input: SeoCreateInput): SeoCreateInput {
    return {
      ...input,
      page_slug: input.page_slug.trim(),
      meta_title: input.meta_title.trim(),
      meta_description: input.meta_description.trim(),
      canonical_url: input.canonical_url?.trim() || null,
      schema_json: input.schema_json ?? {},
    };
  }

  private normalizeUpdateInput(input: SeoUpdateInput): SeoUpdateInput {
    return {
      ...input,
      ...(input.page_slug ? { page_slug: input.page_slug.trim() } : {}),
      ...(input.meta_title ? { meta_title: input.meta_title.trim() } : {}),
      ...(input.meta_description
        ? { meta_description: input.meta_description.trim() }
        : {}),
      ...("canonical_url" in input
        ? { canonical_url: input.canonical_url?.trim() || null }
        : {}),
    };
  }

  private async assertUniquePage(
    pageType: PageType,
    pageSlug: string,
    currentSeoId?: string,
  ) {
    const existingSeo = await this.seoRepository.getSeoByPage(pageType, pageSlug);

    if (existingSeo && existingSeo.id !== currentSeoId) {
      throw new ValidationError("An SEO record already exists for this page.");
    }
  }

  private assertValid(input: SeoCreateInput | SeoUpdateInput, mode: "create" | "update") {
    const result = validateSeoInput(input, mode);

    if (!result.success) {
      throw new ValidationError(result.errors.join(" "));
    }
  }
}
