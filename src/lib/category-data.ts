export type CategoryProduct = {
  slug: string;
  href?: string;
  name: string;
  category: string;
  rating: string;
  description: string;
  image?: string;
  accent: string;
  glow: string;
  featured?: boolean;
};

export type CategoryDetail = {
  slug: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  image?: string;
  stats: string[];
  products: CategoryProduct[];
  featured: CategoryProduct[];
  relatedCategories: ({ label: string; slug: string } | string)[];
  seoTitle: string;
  seoParagraphs: string[];
  facts: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
};
