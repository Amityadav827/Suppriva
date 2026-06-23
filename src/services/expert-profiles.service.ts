import { isAdmin } from "@/lib/auth/admin";
import { DEFAULT_AUTHOR_PROFILE, DEFAULT_REVIEWER_PROFILE, slugifyProfileName } from "@/lib/eeat/default-profiles";
import type { Author, Reviewer } from "@/lib/database/types";
import { AppError } from "@/lib/errors/AppError";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  type ExpertProfileCreateInput,
  type ExpertProfileUpdateInput,
  validateExpertProfileInput,
} from "@/lib/validators/expert-profile.validator";
import {
  SupabaseAuthorsRepository,
  SupabaseReviewersRepository,
  type ExpertProfilesRepository,
} from "@/repositories/expert-profiles.repository";

type ExpertProfileRecord = Author | Reviewer;

type ServiceOptions<TProfile extends ExpertProfileRecord> = {
  profileLabel: string;
  defaultProfile: Omit<ExpertProfileCreateInput, "slug"> & { name: string; slug: string };
  repository: ExpertProfilesRepository<TProfile>;
};

class ExpertProfilesService<TProfile extends ExpertProfileRecord> {
  constructor(private readonly options: ServiceOptions<TProfile>) {}

  get repository() {
    return this.options.repository;
  }

  async getAllProfiles() {
    return this.options.repository.getAllProfiles();
  }

  async getActiveProfiles() {
    return this.options.repository.getActiveProfiles();
  }

  async getProfileById(id: string) {
    const profile = await this.options.repository.getProfileById(id);

    if (!profile) {
      throw new AppError(`${this.options.profileLabel} not found.`, `${this.options.profileLabel.toUpperCase()}_NOT_FOUND`, 404);
    }

    return profile;
  }

  async getProfileBySlug(slug: string) {
    const profile = await this.options.repository.getProfileBySlug(slug);

    if (!profile) {
      throw new AppError(`${this.options.profileLabel} not found.`, `${this.options.profileLabel.toUpperCase()}_NOT_FOUND`, 404);
    }

    return profile;
  }

  async createProfile(input: ExpertProfileCreateInput) {
    await this.ensureAdminAccess();
    const normalizedInput = this.normalizeCreateInput(input);
    this.assertValid(normalizedInput, "create");
    await this.assertUniqueSlug(normalizedInput.slug);

    return this.options.repository.createProfile(normalizedInput);
  }

  async updateProfile(id: string, input: ExpertProfileUpdateInput) {
    await this.ensureAdminAccess();
    await this.getProfileById(id);
    const normalizedInput = this.normalizeUpdateInput(input);
    this.assertValid(normalizedInput, "update");

    if (normalizedInput.slug) {
      await this.assertUniqueSlug(normalizedInput.slug, id);
    }

    return this.options.repository.updateProfile(id, normalizedInput);
  }

  async deleteProfile(id: string) {
    await this.ensureAdminAccess();
    const profile = await this.getProfileById(id);

    if (profile.slug === this.options.defaultProfile.slug) {
      throw new ValidationError(`The default ${this.options.profileLabel.toLowerCase()} profile cannot be deleted.`);
    }

    await this.options.repository.deleteProfile(id);
  }

  async assertProfileExists(id: string) {
    const profile = await this.options.repository.getProfileById(id);

    if (!profile) {
      throw new ValidationError(`Selected ${this.options.profileLabel.toLowerCase()} does not exist.`);
    }

    return profile;
  }

  async getDefaultProfile() {
    const existingProfile = await this.options.repository.getProfileBySlug(this.options.defaultProfile.slug);

    if (existingProfile) {
      return existingProfile;
    }

    return this.options.repository.createProfile(this.options.defaultProfile);
  }

  async getDefaultProfileId() {
    const profile = await this.getDefaultProfile();
    return profile.id;
  }

  async resolveAssignedProfileId(id?: string | null) {
    if (id) {
      const profile = await this.assertProfileExists(id);
      return profile.id;
    }

    return this.getDefaultProfileId();
  }

  private normalizeCreateInput(input: ExpertProfileCreateInput): ExpertProfileCreateInput {
    const name = input.name.trim();
    const slug = input.slug?.trim() || slugifyProfileName(name);

    return {
      ...input,
      name,
      slug,
      photo_url: input.photo_url?.trim() || null,
      designation: input.designation?.trim() || null,
      qualification: input.qualification?.trim() || null,
      bio: input.bio?.trim() || null,
      linkedin_url: input.linkedin_url?.trim() || null,
      website_url: input.website_url?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      is_active: input.is_active ?? true,
    };
  }

  private normalizeUpdateInput(input: ExpertProfileUpdateInput): ExpertProfileUpdateInput {
    const normalizedInput: ExpertProfileUpdateInput = {
      ...input,
    };

    if ("name" in input && input.name !== undefined) {
      normalizedInput.name = input.name.trim();
    }

    if ("slug" in input) {
      normalizedInput.slug = input.slug?.trim() || undefined;
    }

    if ("photo_url" in input) normalizedInput.photo_url = input.photo_url?.trim() || null;
    if ("designation" in input) normalizedInput.designation = input.designation?.trim() || null;
    if ("qualification" in input) normalizedInput.qualification = input.qualification?.trim() || null;
    if ("bio" in input) normalizedInput.bio = input.bio?.trim() || null;
    if ("linkedin_url" in input) normalizedInput.linkedin_url = input.linkedin_url?.trim() || null;
    if ("website_url" in input) normalizedInput.website_url = input.website_url?.trim() || null;
    if ("email" in input) normalizedInput.email = input.email?.trim().toLowerCase() || null;

    return normalizedInput;
  }

  private async assertUniqueSlug(slug?: string, currentId?: string) {
    if (!slug) {
      throw new ValidationError(`${this.options.profileLabel} slug is required.`);
    }

    const existingProfile = await this.options.repository.getProfileBySlug(slug);

    if (existingProfile && existingProfile.id !== currentId) {
      throw new ValidationError(`A ${this.options.profileLabel.toLowerCase()} with this slug already exists.`);
    }
  }

  private assertValid(input: ExpertProfileCreateInput | ExpertProfileUpdateInput, mode: "create" | "update") {
    const result = validateExpertProfileInput(input, mode);

    if (!result.success) {
      throw new ValidationError(result.errors.join(" "));
    }
  }

  private async ensureAdminAccess() {
    const allowed = await isAdmin();

    if (!allowed) {
      throw new AppError("Admin access required.", "FORBIDDEN", 403);
    }
  }
}

export class AuthorsService extends ExpertProfilesService<Author> {
  constructor(repository: ExpertProfilesRepository<Author> = new SupabaseAuthorsRepository()) {
    super({
      profileLabel: "Author",
      defaultProfile: DEFAULT_AUTHOR_PROFILE,
      repository,
    });
  }
}

export class ReviewersService extends ExpertProfilesService<Reviewer> {
  constructor(repository: ExpertProfilesRepository<Reviewer> = new SupabaseReviewersRepository()) {
    super({
      profileLabel: "Reviewer",
      defaultProfile: DEFAULT_REVIEWER_PROFILE,
      repository,
    });
  }
}
