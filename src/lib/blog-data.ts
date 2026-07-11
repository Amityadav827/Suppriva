import type { ExpertAttribution } from "@/lib/database/types";

export type BlogArticle = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  readingTime: string;
  publishDate: string;
  lastUpdated: string;
  author: {
    name: string;
    expertise: string;
    bio: string;
  };
  expertAttribution: ExpertAttribution;
  image: string;
  toc: {
    id: string;
    label: string;
  }[];
  sections: {
    id: string;
    title: string;
    content: string;
    level?: number;
    intro?: string;
    h3?: string;
    bullets?: string[];
    quote?: string;
  }[];
  callouts: {
    type: string;
    title: string;
    text: string;
  }[];
  table: {
    title: string;
    rows: string[][];
  } | null;
  recommended: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
  related: string[];
};
