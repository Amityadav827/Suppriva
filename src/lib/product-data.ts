export type ProductDetail = {
  slug: string;
  path: string;
  productId?: string;
  affiliateUrl?: string;
  image?: string;
  gallery?: string[];
  name: string;
  category: string;
  categorySlug?: string;
  rating: string;
  ratingValue: number;
  reviewCount: number;
  subtitle: string;
  description: string;
  bullets: string[];
  trustBadges: string[];
  standoutPoints: string[];
  howItWorks: string[];
  whoItsBestFor: string[];
  bestFor: string;
  benefits: {
    title: string;
    description: string;
  }[];
  ingredients: {
    name: string;
    benefit: string;
    slug?: string;
    purpose?: string;
    description?: string;
    image?: string;
    category?: string;
    scientificName?: string | null;
  }[];
  safety: {
    sideEffects: string[];
    whoShouldAvoid: string[];
    drugInteractions: string[];
    precautions: string[];
  };
  pros: string[];
  cons: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
  verdict: {
    summary: string;
    bestFor: string;
    notIdealFor: string;
    recommendation: string;
  };
  buyingGuidance: string[];
  relatedIngredients: {
    name: string;
    slug?: string;
    benefit?: string;
    image?: string;
    category?: string;
    scientificName?: string | null;
  }[];
  relatedArticles: {
    slug?: string;
    title: string;
    description: string;
    category: string;
    categorySlug?: string;
    readingTime: string;
    image: string;
  }[];
  healthNeeds: {
    label: string;
    slug?: string;
    description: string;
  }[];
  related: string[];
  comparisonProducts: {
    slug?: string;
    href?: string;
    name: string;
    subtitle: string;
    category: string;
    rating: string;
    image?: string;
    glow: string;
    accent: string;
  }[];
  relatedProducts?: {
    slug?: string;
    href?: string;
    name: string;
    subtitle: string;
    category: string;
    rating: string;
    image?: string;
    glow: string;
    accent: string;
  }[];
};
