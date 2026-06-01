export type ProductDetail = {
  slug: string;
  productId?: string;
  affiliateUrl?: string;
  image?: string;
  gallery?: string[];
  name: string;
  category: string;
  rating: string;
  description: string;
  bullets: string[];
  trustBadges: string[];
  benefits: {
    title: string;
    description: string;
  }[];
  ingredients: {
    name: string;
    benefit: string;
  }[];
  pros: string[];
  cons: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
  related: string[];
  relatedProducts?: {
    slug?: string;
    name: string;
    subtitle: string;
    category: string;
    rating: string;
    image?: string;
    glow: string;
    accent: string;
  }[];
};
