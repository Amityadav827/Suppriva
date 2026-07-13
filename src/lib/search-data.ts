export type SearchResultType = "product" | "category" | "article" | "ingredient";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  category: string;
  description: string;
  href: string;
  image?: string;
  scientificName?: string | null;
  rating?: string;
  readingTime?: string;
};
