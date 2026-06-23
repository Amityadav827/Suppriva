import type { BlogArticle } from "@/lib/blog-data";
import type { Blog, ExpertAttribution, JsonValue } from "@/lib/database/types";

type BlogContentObject = {
  body?: string;
  summary?: string;
  category?: string;
  readingTime?: string;
  publishDate?: string;
  image?: string;
  toc?: BlogArticle["toc"];
  sections?: BlogArticle["sections"];
  callouts?: BlogArticle["callouts"];
  table?: BlogArticle["table"];
  recommended?: string[];
  faqs?: BlogArticle["faqs"];
  related?: string[];
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

function createDefaultSections(blog: Blog, body?: string): BlogArticle["sections"] {
  const intro =
    body ||
    blog.excerpt ||
    "This Suppriva guide is prepared for premium supplement research and wellness discovery.";

  return [
    {
      id: "introduction",
      title: "Introduction",
      intro,
    },
    {
      id: "benefits",
      title: "Key Wellness Notes",
      intro:
        "Compare supplement positioning, ingredient clarity, usage guidance, and how the topic fits into a sustainable wellness routine.",
    },
    {
      id: "usage",
      title: "How To Use This Guide",
      intro:
        "Use this article as a starting point for research, then review official product labels and consult a qualified professional when needed.",
    },
  ];
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
  const sections = Array.isArray(content.sections)
    ? content.sections
    : createDefaultSections(blog, body);

  return {
    slug: blog.slug,
    title: blog.title,
    summary:
      blog.excerpt ||
      (typeof content.summary === "string" ? content.summary : undefined) ||
      "A premium Suppriva wellness guide prepared for supplement research and smarter comparison.",
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
    toc: Array.isArray(content.toc)
      ? content.toc
      : sections.map((section) => ({ id: section.id, label: section.title })),
    sections,
    callouts: Array.isArray(content.callouts)
      ? content.callouts
      : [
          {
            type: "Key Takeaway",
            title: "Compare with context",
            text: "Supplement decisions are strongest when ingredient quality, usage guidance, and lifestyle fit are reviewed together.",
          },
        ],
    table: content.table ?? {
      title: "Supplement Research Notes",
      rows: [
        ["Ingredient clarity", "Better comparison", "Review official labels"],
        ["Usage fit", "Routine consistency", "Avoid over-stacking"],
        ["Brand trust", "Confidence signal", "Check sourcing and claims"],
      ],
    },
    recommended: Array.isArray(content.recommended)
      ? content.recommended
      : ["Java Burn", "Neuro Thrive", "GlucoTrust"],
    faqs: Array.isArray(content.faqs)
      ? content.faqs
      : [
          {
            question: "How should I use this guide?",
            answer:
              "Use it as a research starting point and compare product labels, ingredient quality, and personal wellness needs.",
          },
          {
            question: "Are supplements right for everyone?",
            answer:
              "No. Suitability depends on health status, medications, goals, and tolerance. Seek qualified advice when unsure.",
          },
        ],
    related: Array.isArray(content.related) ? content.related : [],
  };
}
