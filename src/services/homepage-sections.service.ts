import {
  DEFAULT_HOMEPAGE_SECTIONS,
  mergeHomepageSections,
  type HomepageSectionConfig,
} from "@/lib/homepage-sections";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type HomepageSectionInput,
  validateHomepageSectionsInput,
} from "@/lib/validators/homepage-section.validator";
import {
  SupabaseHomepageSectionsRepository,
  type HomepageSectionsRepository,
} from "@/repositories/homepage-sections.repository";

export class HomepageSectionsService {
  constructor(
    private readonly homepageSectionsRepository: HomepageSectionsRepository =
      new SupabaseHomepageSectionsRepository(),
  ) {}

  async getHomepageSections() {
    const sections = await this.homepageSectionsRepository.getAllHomepageSections();

    return mergeHomepageSections(sections);
  }

  async safeGetHomepageSections() {
    try {
      return await this.getHomepageSections();
    } catch {
      return DEFAULT_HOMEPAGE_SECTIONS;
    }
  }

  async updateHomepageSections(input: { sections: HomepageSectionInput[] }) {
    const validation = validateHomepageSectionsInput(input);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const normalizedSections = input.sections.map((section) =>
      this.normalizeSectionInput(section),
    );
    const savedSections =
      await this.homepageSectionsRepository.upsertHomepageSections(normalizedSections);

    return mergeHomepageSections(savedSections);
  }

  private normalizeSectionInput(section: HomepageSectionInput): HomepageSectionConfig {
    return {
      section_key: section.section_key,
      section_name: section.section_name?.trim() || section.section_key,
      is_visible: section.is_visible ?? true,
      sort_order: section.sort_order ?? 0,
      title: section.title?.trim() || null,
      subtitle: section.subtitle?.trim() || null,
      cta_label: section.cta_label?.trim() || null,
      cta_url: section.cta_url?.trim() || null,
    };
  }
}
