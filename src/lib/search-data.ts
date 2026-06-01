export type SearchResultType = "product" | "category" | "article";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  category: string;
  description: string;
  href: string;
  image?: string;
  rating?: string;
  readingTime?: string;
};
