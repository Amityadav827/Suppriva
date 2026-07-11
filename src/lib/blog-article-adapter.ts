import type { BlogArticle } from "@/lib/blog-data";
import type { Blog, ExpertAttribution, JsonValue } from "@/lib/database/types";

type BlogContentObject = {
  body?: string;
  summary?: string;
  category?: string;
  readingTime?: string;
  publishDate?: string;
  image?: string;
  featuredImageMetadata?: BlogArticle["imageMetadata"];
  toc?: BlogArticle["toc"];
  sections?: BlogArticle["sections"];
  faqs?: BlogArticle["faqs"];
};

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asContentObject(content: JsonValue): BlogContentObject {
  if (!isRecord(content)) {
    return {};
  }

  return content as BlogContentObject;
}

function readImageMetadata(
  content: BlogContentObject,
  fallbackAlt: string,
): BlogArticle["imageMetadata"] {
  const metadata = content.featuredImageMetadata;

  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
    return {
      alt: fallbackAlt,
      title: fallbackAlt,
      caption: "",
    };
  }

  return {
    alt: typeof metadata.alt === "string" && metadata.alt.trim() ? metadata.alt : fallbackAlt,
    title:
      typeof metadata.title === "string" && metadata.title.trim()
        ? metadata.title
        : fallbackAlt,
    caption:
      typeof metadata.caption === "string" && metadata.caption.trim()
        ? metadata.caption
        : "",
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function stripFormatting(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~`>#-]/g, "")
    .trim();
}

function createHeadingId(title: string, index: number) {
  const slug = stripFormatting(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `blog-heading-${index + 1}`;
}

function normalizeLegacyTitle(title: string | undefined, fallbackTitle: string, index: number) {
  const cleanTitle = stripFormatting(title ?? "");

  if (!cleanTitle || /^section\s+\d+$/i.test(cleanTitle)) {
    return index === 0 ? fallbackTitle : `${fallbackTitle} Notes`;
  }

  return cleanTitle;
}

function parseHeading(line: string) {
  const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);

  if (!match) {
    return null;
  }

  const title = stripFormatting(match[2]);

  if (!title) {
    return null;
  }

  return {
    level: match[1].length,
    title,
  };
}

function parseBodySections(
  body: string | undefined,
  fallbackTitle: string,
  fallbackContent: string,
): BlogArticle["sections"] {
  const source = body?.trim() || fallbackContent.trim();

  if (!source) {
    return [];
  }

  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const sections: BlogArticle["sections"] = [];
  const introLines: string[] = [];
  let current:
    | {
        id: string;
        title: string;
        level: number;
        contentLines: string[];
      }
    | null = null;

  function pushCurrent() {
    if (!current) {
      return;
    }

    sections.push({
      id: current.id,
      title: current.title,
      level: current.level,
      content: current.contentLines.join("\n").trim(),
    });
  }

  for (const line of lines) {
    const heading = parseHeading(line);

    if (heading) {
      pushCurrent();
      current = {
        id: createHeadingId(heading.title, sections.length),
        title: heading.title,
        level: heading.level,
        contentLines: [],
      };
      continue;
    }

    if (current) {
      current.contentLines.push(line);
    } else {
      introLines.push(line);
    }
  }

  pushCurrent();

  const intro = introLines.join("\n").trim();

  if (!sections.length) {
    return [
      {
        id: createHeadingId(fallbackTitle, 0),
        title: fallbackTitle,
        level: 2,
        content: source,
      },
    ];
  }

  if (intro) {
    sections[0] = {
      ...sections[0],
      content: [intro, sections[0].content].filter(Boolean).join("\n\n"),
    };
  }

  return sections;
}

function legacySectionsToRichSections(
  legacySections: BlogContentObject["sections"],
  fallbackTitle: string,
  fallbackContent: string,
): BlogArticle["sections"] {
  if (!Array.isArray(legacySections) || !legacySections.length) {
    return parseBodySections(undefined, fallbackTitle, fallbackContent);
  }

  const richSections: BlogArticle["sections"] = [];

  legacySections.forEach((section, index) => {
    if (!isRecord(section as JsonValue)) {
      return;
    }

    const title = normalizeLegacyTitle(
      typeof section.title === "string" ? section.title : undefined,
      fallbackTitle,
      index,
    );
    const h3 = typeof section.h3 === "string" ? `### ${section.h3}` : "";
    const bullets = Array.isArray(section.bullets)
      ? section.bullets
          .filter((item): item is string => typeof item === "string")
          .map((item) => `- ${item}`)
          .join("\n")
      : "";
    const quote = typeof section.quote === "string" ? `> ${section.quote}` : "";
    const intro = typeof section.intro === "string" ? section.intro : "";
    const content = [intro, h3, bullets, quote].filter(Boolean).join("\n\n");

    richSections.push({
      id:
        typeof section.id === "string"
          ? section.id
          : createHeadingId(title, index),
      title,
      level: 2,
      content,
    });
  });

  return richSections;
}

export function blogToArticle(
  blog: Blog,
  expertAttribution: ExpertAttribution,
): BlogArticle {
  const content = asContentObject(blog.content);
  const body = typeof content.body === "string" ? content.body : undefined;
  const category = typeof content.category === "string" ? content.category : blog.tags[0];
  const image =
    blog.featured_image ||
    (typeof content.image === "string" ? content.image : undefined) ||
    "/assets/blog-weight-loss.webp";
  const summary =
    blog.excerpt ||
    (typeof content.summary === "string" ? content.summary : undefined) ||
    "A premium Suppriva wellness guide prepared for supplement research and smarter comparison.";
  const sections = body?.trim()
    ? parseBodySections(body, blog.title, summary)
    : legacySectionsToRichSections(content.sections, blog.title, summary);
  const toc = sections
    .filter((section) => (section.level ?? 2) === 2 || (section.level ?? 2) === 3)
    .map((section) => ({ id: section.id, label: section.title }));

  return {
    slug: blog.slug,
    title: blog.title,
    summary,
    category: category || "Wellness Guide",
    readingTime:
      blog.reading_time ||
      (typeof content.readingTime === "string" ? content.readingTime : undefined) ||
      "5 min read",
    publishDate:
      typeof content.publishDate === "string"
        ? content.publishDate
        : formatDate(blog.published_at || blog.created_at),
    lastUpdated: formatDate(blog.updated_at || blog.published_at || blog.created_at),
    author: {
      name: expertAttribution.author.name,
      expertise:
        [expertAttribution.author.designation, expertAttribution.author.qualification]
          .filter(Boolean)
          .join(" • ") || "Suppriva Editorial Contributor",
      bio:
        expertAttribution.author.bio ||
        "Suppriva contributors help readers research supplements, ingredients, and wellness solutions with clearer editorial context.",
    },
    expertAttribution,
    image,
    imageMetadata: readImageMetadata(content, blog.title),
    toc: toc.length ? toc : sections.map((section) => ({ id: section.id, label: section.title })),
    sections,
    faqs: Array.isArray(content.faqs) ? content.faqs : [],
  };
}
