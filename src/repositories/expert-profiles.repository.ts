import type { Author, Reviewer } from "@/lib/database/types";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ExpertProfileCreateInput,
  ExpertProfileUpdateInput,
} from "@/lib/validators/expert-profile.validator";
import type { SlugRepository } from "./base.repository";

export type ExpertProfileRecord = Author | Reviewer;
export type ExpertProfileTable = "authors" | "reviewers";

export interface ExpertProfilesRepository<TProfile extends ExpertProfileRecord>
  extends SlugRepository<TProfile> {
  getAllProfiles(): Promise<TProfile[]>;
  getActiveProfiles(): Promise<TProfile[]>;
  getProfileById(id: string): Promise<TProfile | null>;
  getProfileBySlug(slug: string): Promise<TProfile | null>;
  createProfile(input: ExpertProfileCreateInput): Promise<TProfile>;
  updateProfile(id: string, input: ExpertProfileUpdateInput): Promise<TProfile>;
  deleteProfile(id: string): Promise<void>;
}

type RepositoryOptions = {
  tableName: ExpertProfileTable;
  supportsDeletedAt?: boolean;
};

class SupabaseExpertProfilesRepository<TProfile extends ExpertProfileRecord>
  implements ExpertProfilesRepository<TProfile>
{
  constructor(private readonly options: RepositoryOptions) {}

  async getAllProfiles(): Promise<TProfile[]> {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from(this.options.tableName)
      .select("*")
      .order("name", { ascending: true });

    if (this.options.supportsDeletedAt) {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as TProfile[];
  }

  async getActiveProfiles(): Promise<TProfile[]> {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from(this.options.tableName)
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (this.options.supportsDeletedAt) {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as TProfile[];
  }

  async getProfileById(id: string): Promise<TProfile | null> {
    const supabase = await createSupabaseServerClient();
    const query = this.options.supportsDeletedAt
      ? supabase
          .from(this.options.tableName)
          .select("*")
          .eq("id", id)
          .is("deleted_at", null)
          .maybeSingle()
      : supabase.from(this.options.tableName).select("*").eq("id", id).maybeSingle();

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as TProfile | null) ?? null;
  }

  async getProfileBySlug(slug: string): Promise<TProfile | null> {
    const supabase = await createSupabaseServerClient();
    const query = this.options.supportsDeletedAt
      ? supabase
          .from(this.options.tableName)
          .select("*")
          .eq("slug", slug)
          .is("deleted_at", null)
          .maybeSingle()
      : supabase
          .from(this.options.tableName)
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as TProfile | null) ?? null;
  }

  async createProfile(input: ExpertProfileCreateInput): Promise<TProfile> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(this.options.tableName)
      .insert(this.toDatabaseInput(input))
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as TProfile;
  }

  async updateProfile(id: string, input: ExpertProfileUpdateInput): Promise<TProfile> {
    const supabase = await createSupabaseServerClient();
    const query = this.options.supportsDeletedAt
      ? supabase
          .from(this.options.tableName)
          .update(this.toDatabaseInput(input))
          .eq("id", id)
          .is("deleted_at", null)
          .select("*")
          .single()
      : supabase
          .from(this.options.tableName)
          .update(this.toDatabaseInput(input))
          .eq("id", id)
          .select("*")
          .single();

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as TProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const query = this.options.supportsDeletedAt
      ? supabase.from(this.options.tableName).delete().eq("id", id).is("deleted_at", null)
      : supabase.from(this.options.tableName).delete().eq("id", id);

    const { error } = await query;

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  getAll(): Promise<TProfile[]> {
    return this.getAllProfiles();
  }

  getById(id: string): Promise<TProfile | null> {
    return this.getProfileById(id);
  }

  getBySlug(slug: string): Promise<TProfile | null> {
    return this.getProfileBySlug(slug);
  }

  create(input: ExpertProfileCreateInput): Promise<TProfile> {
    return this.createProfile(input);
  }

  update(id: string, input: ExpertProfileUpdateInput): Promise<TProfile> {
    return this.updateProfile(id, input);
  }

  delete(id: string): Promise<void> {
    return this.deleteProfile(id);
  }

  private toDatabaseInput(input: ExpertProfileCreateInput | ExpertProfileUpdateInput) {
    const payload: Record<string, unknown> = {};

    if ("name" in input) payload.name = input.name;
    if ("slug" in input) payload.slug = input.slug;
    if ("photo_url" in input) payload.photo_url = input.photo_url ?? null;
    if ("designation" in input) payload.designation = input.designation ?? null;
    if ("qualification" in input) payload.qualification = input.qualification ?? null;
    if ("experience_years" in input) payload.experience_years = input.experience_years ?? null;
    if ("bio" in input) payload.bio = input.bio ?? null;
    if ("linkedin_url" in input) payload.linkedin_url = input.linkedin_url ?? null;
    if ("website_url" in input) payload.website_url = input.website_url ?? null;
    if ("email" in input) payload.email = input.email ?? null;
    if ("is_active" in input) payload.is_active = input.is_active ?? true;

    return payload;
  }
}

export class SupabaseAuthorsRepository extends SupabaseExpertProfilesRepository<Author> {
  constructor() {
    super({ tableName: "authors", supportsDeletedAt: true });
  }
}

export class SupabaseReviewersRepository extends SupabaseExpertProfilesRepository<Reviewer> {
  constructor() {
    super({ tableName: "reviewers" });
  }
}
