import type { MediaLibraryItem } from "@/lib/database/types";
import { DATABASE_TABLES } from "@/lib/database/constants";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  MediaLibraryCreateInput,
  MediaLibraryUpdateInput,
} from "@/lib/validators/media-library.validator";

export type MediaLibraryFilters = {
  query?: string;
  mimeType?: string;
  tag?: string;
};

export interface MediaLibraryRepository {
  listMedia(filters?: MediaLibraryFilters): Promise<MediaLibraryItem[]>;
  getMediaById(id: string): Promise<MediaLibraryItem | null>;
  getMediaByFileName(fileName: string): Promise<MediaLibraryItem | null>;
  createMedia(input: MediaLibraryCreateInput): Promise<MediaLibraryItem>;
  updateMedia(id: string, input: MediaLibraryUpdateInput & Partial<MediaLibraryCreateInput>): Promise<MediaLibraryItem>;
  deleteMedia(id: string): Promise<void>;
}

export class SupabaseMediaLibraryRepository implements MediaLibraryRepository {
  async listMedia(filters: MediaLibraryFilters = {}): Promise<MediaLibraryItem[]> {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from(DATABASE_TABLES.mediaLibrary)
      .select("*")
      .order("created_at", { ascending: false });

    const normalizedQuery = filters.query?.trim();
    if (normalizedQuery) {
      query = query.or(
        `title.ilike.%${normalizedQuery}%,file_name.ilike.%${normalizedQuery}%,slug.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%,alt_text.ilike.%${normalizedQuery}%`,
      );
    }

    if (filters.mimeType?.trim()) {
      query = query.eq("mime_type", filters.mimeType.trim());
    }

    if (filters.tag?.trim()) {
      query = query.contains("tags", [filters.tag.trim()]);
    }

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as MediaLibraryItem[];
  }

  async getMediaById(id: string): Promise<MediaLibraryItem | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(DATABASE_TABLES.mediaLibrary)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as MediaLibraryItem | null) ?? null;
  }

  async getMediaByFileName(fileName: string): Promise<MediaLibraryItem | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(DATABASE_TABLES.mediaLibrary)
      .select("*")
      .eq("file_name", fileName)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as MediaLibraryItem | null) ?? null;
  }

  async createMedia(input: MediaLibraryCreateInput): Promise<MediaLibraryItem> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(DATABASE_TABLES.mediaLibrary)
      .insert({
        ...input,
        tags: input.tags ?? [],
      })
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as MediaLibraryItem;
  }

  async updateMedia(
    id: string,
    input: MediaLibraryUpdateInput & Partial<MediaLibraryCreateInput>,
  ): Promise<MediaLibraryItem> {
    const supabase = await createSupabaseServerClient();
    const payload: Record<string, unknown> = {};

    if ("file_name" in input) payload.file_name = input.file_name;
    if ("file_url" in input) payload.file_url = input.file_url;
    if ("title" in input) payload.title = input.title;
    if ("alt_text" in input) payload.alt_text = input.alt_text ?? null;
    if ("caption" in input) payload.caption = input.caption ?? null;
    if ("description" in input) payload.description = input.description ?? null;
    if ("slug" in input) payload.slug = input.slug;
    if ("tags" in input) payload.tags = input.tags ?? [];
    if ("width" in input) payload.width = input.width ?? null;
    if ("height" in input) payload.height = input.height ?? null;
    if ("file_size" in input) payload.file_size = input.file_size ?? null;
    if ("mime_type" in input) payload.mime_type = input.mime_type;

    const { data, error } = await supabase
      .from(DATABASE_TABLES.mediaLibrary)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as MediaLibraryItem;
  }

  async deleteMedia(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from(DATABASE_TABLES.mediaLibrary)
      .delete()
      .eq("id", id);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }
}
