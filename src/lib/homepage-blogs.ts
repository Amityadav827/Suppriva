import type { Blog } from "@/lib/database/types";

type Timestamp = string;

export const HOMEPAGE_BLOG_SORT_MODES = [
  "latest",
  "featured",
  "manual_priority",
] as const;

export type HomepageBlogSortMode = (typeof HOMEPAGE_BLOG_SORT_MODES)[number];

export type HomepageBlogsSettings = {
  id?: string;
  max_blogs: number;
  sort_mode: HomepageBlogSortMode;
  show_featured_badge: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepageBlogsCms = {
  settings: HomepageBlogsSettings;
};

export const DEFAULT_HOMEPAGE_BLOGS: HomepageBlogsCms = {
  settings: {
    max_blogs: 4,
    sort_mode: "latest",
    show_featured_badge: true,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function timestampValue(value: string | null | undefined) {
  return value ? new Date(value).getTime() : 0;
}

function latestTime(blog: Blog) {
  return timestampValue(blog.published_at) || timestampValue(blog.created_at);
}

function hasFeaturedSignal(blog: Blog) {
  const tags = Array.isArray(blog.tags) ? blog.tags : [];
  const content = isRecord(blog.content) ? blog.content : {};

  return (
    tags.some((tag) => tag.toLowerCase() === "featured") ||
    content.featured === true ||
    content.isFeatured === true ||
    content.homepageFeatured === true
  );
}

function manualPriority(blog: Blog) {
  const tags = Array.isArray(blog.tags) ? blog.tags : [];
  const content = isRecord(blog.content) ? blog.content : {};
  const contentPriority =
    typeof content.homepagePriority === "number"
      ? content.homepagePriority
      : typeof content.manualPriority === "number"
        ? content.manualPriority
        : null;

  if (contentPriority !== null && Number.isFinite(contentPriority)) {
    return contentPriority;
  }

  const priorityTag = tags.find((tag) => /^priority:\d+$/i.test(tag.trim()));
  if (!priorityTag) {
    return null;
  }

  return Number(priorityTag.split(":")[1]);
}

export function isHomepageBlogSortMode(value: string): value is HomepageBlogSortMode {
  return (HOMEPAGE_BLOG_SORT_MODES as readonly string[]).includes(value);
}

export function mergeHomepageBlogsCms(
  input: Partial<HomepageBlogsCms> | null | undefined,
) {
  const settings = input?.settings;
  const maxBlogs =
    typeof settings?.max_blogs === "number" && settings.max_blogs > 0
      ? Math.min(Math.floor(settings.max_blogs), 12)
      : DEFAULT_HOMEPAGE_BLOGS.settings.max_blogs;

  return {
    settings: {
      ...DEFAULT_HOMEPAGE_BLOGS.settings,
      ...settings,
      max_blogs: maxBlogs,
      sort_mode:
        settings?.sort_mode && isHomepageBlogSortMode(settings.sort_mode)
          ? settings.sort_mode
          : DEFAULT_HOMEPAGE_BLOGS.settings.sort_mode,
      show_featured_badge:
        typeof settings?.show_featured_badge === "boolean"
          ? settings.show_featured_badge
          : DEFAULT_HOMEPAGE_BLOGS.settings.show_featured_badge,
    },
  };
}

export function selectHomepageBlogs(blogs: Blog[], settings: HomepageBlogsSettings) {
  const sortedBlogs = [...blogs];

  if (settings.sort_mode === "featured") {
    const featuredBlogs = sortedBlogs
      .filter(hasFeaturedSignal)
      .sort((a, b) => latestTime(b) - latestTime(a));

    return (featuredBlogs.length ? featuredBlogs : sortedBlogs).slice(
      0,
      settings.max_blogs,
    );
  }

  if (settings.sort_mode === "manual_priority") {
    sortedBlogs.sort((a, b) => {
      const priorityA = manualPriority(a);
      const priorityB = manualPriority(b);

      if (priorityA !== null && priorityB !== null && priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      if (priorityA !== null) return -1;
      if (priorityB !== null) return 1;

      return latestTime(b) - latestTime(a);
    });

    return sortedBlogs.slice(0, settings.max_blogs);
  }

  return sortedBlogs
    .sort((a, b) => latestTime(b) - latestTime(a))
    .slice(0, settings.max_blogs);
}
