import {
  isHomepageBlogSortMode,
  type HomepageBlogsCms,
  type HomepageBlogsSettings,
} from "@/lib/homepage-blogs";

export function validateHomepageBlogsInput(input: Partial<HomepageBlogsCms>) {
  const errors: string[] = [];
  const settings = input.settings as HomepageBlogsSettings | undefined;

  if (!settings) {
    errors.push("Blog display settings are required.");
  } else {
    if (!Number.isInteger(settings.max_blogs) || settings.max_blogs < 1) {
      errors.push("Maximum blogs to display must be at least 1.");
    }

    if (settings.max_blogs > 12) {
      errors.push("Maximum blogs to display cannot be greater than 12.");
    }

    if (!isHomepageBlogSortMode(settings.sort_mode)) {
      errors.push("Blog sort mode must be latest, featured, or manual priority.");
    }

    if (typeof settings.show_featured_badge !== "boolean") {
      errors.push("Show featured badge must be true or false.");
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
