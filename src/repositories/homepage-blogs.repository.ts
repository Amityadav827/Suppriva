import type {
  HomepageBlogsCms,
  HomepageBlogsSettings,
} from "@/lib/homepage-blogs";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HomepageBlogsRepository {
  getHomepageBlogs(): Promise<Partial<HomepageBlogsCms>>;
  updateHomepageBlogs(input: HomepageBlogsCms): Promise<Partial<HomepageBlogsCms>>;
}

export class SupabaseHomepageBlogsRepository implements HomepageBlogsRepository {
  async getHomepageBlogs() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("homepage_blogs_settings")
      .select("*")
      .eq("id", "home")
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return {
      settings: data as HomepageBlogsSettings | undefined,
    };
  }

  async updateHomepageBlogs(input: HomepageBlogsCms) {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("homepage_blogs_settings")
      .upsert({
        id: "home",
        ...this.toSettingsInput(input.settings),
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return this.getHomepageBlogs();
  }

  private toSettingsInput(settings: HomepageBlogsSettings) {
    return {
      max_blogs: settings.max_blogs,
      sort_mode: settings.sort_mode,
      show_featured_badge: settings.show_featured_badge,
    };
  }
}
