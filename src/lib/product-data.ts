import type { ExpertAttribution } from "@/lib/database/types";
import type { ProductLayoutSectionKey } from "@/lib/product-layout";

export type ProductDetailCmsCard = {
  icon?: string | null;
  title: string;
  description?: string | null;
};

export type ProductDetailSidebarFact = {
  icon?: string | null;
  label: string;
  value: string;
};

export type ProductDetailTocItem = {
  id: string;
  label: string;
  icon?: string | null;
};

export type ProductDetailLayoutSection = {
  sectionKey: ProductLayoutSectionKey;
  anchorId: string;
  name: string;
  isVisible: boolean;
  sortOrder: number;
  titleOverride?: string | null;
  subtitleOverride?: string | null;
  backgroundStyle: "default";
  animationEnabled: boolean;
};

export type ProductDetail = {
  slug: string;
  path: string;
  productId?: string;
  affiliateUrl?: string;
  image?: string;
  gallery?: string[];
  name: string;
  heroTitle: string;
  heroBadge?: string | null;
  heroImageAlt?: string | null;
  heroCtaLabel: string;
  heroCtaTarget: "_self" | "_blank";
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaTarget: "_self" | "_blank";
  heroChecklist: {
    icon?: string | null;
    text: string;
  }[];
  heroHighlights: {
    icon?: string | null;
    title: string;
    description?: string | null;
  }[];
  heroShowRating: boolean;
  heroShowBadge: boolean;
  category: string;
  categorySlug?: string;
  rating: string;
  ratingValue: number;
  ratingScaleLabel: string;
  reviewCount: number;
  subtitle: string;
  description: string;
  bullets: string[];
  trustBadges: string[];
  whatIs: {
    title: string;
    subtitle: string;
    paragraphs: string[];
  };
  standoutTitle: string;
  standoutSubtitle: string;
  standoutPoints: ProductDetailCmsCard[];
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  howItWorksIntro: string[];
  howItWorks: ProductDetailCmsCard[];
  benefitsTitle: string;
  benefitsSubtitle: string;
  whoItsBestForTitle: string;
  whoItsBestForSubtitle: string;
  whoItsBestFor: ProductDetailCmsCard[];
  bestFor: string;
  benefits: {
    icon?: string | null;
    title: string;
    description: string;
  }[];
  ingredientsTitle: string;
  ingredientsSubtitle: string;
  ingredients: {
    id?: string;
    name: string;
    benefit: string;
    slug?: string;
    purpose?: string;
    dosage?: string | null;
    customNote?: string | null;
    isHighlighted?: boolean;
    description?: string;
    image?: string;
    category?: string;
    scientificName?: string | null;
  }[];
  safetyTitle: string;
  safetySubtitle: string;
  safetyItems: ProductDetailCmsCard[];
  safety: {
    sideEffects: string[];
    whoShouldAvoid: string[];
    drugInteractions: string[];
    precautions: string[];
  };
  pros: string[];
  cons: string[];
  prosConsTitle: string;
  prosConsSubtitle: string;
  faqTitle: string;
  faqSubtitle: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  verdictTitle: string;
  verdictSubtitle: string;
  verdict: {
    summary: string;
    bestFor: string;
    notIdealFor: string;
    recommendation: string;
    conclusion?: string | null;
  };
  buyingGuideTitle: string;
  buyingGuideSubtitle: string;
  buyingCtaLabel: string;
  buyingGuidance: ProductDetailCmsCard[];
  sidebar: {
    heading: string;
    description: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaLabel: string;
    ctaUrl?: string;
    ctaType: "affiliate" | "internal" | "external" | "ask_expert";
    stickyEnabled: boolean;
    facts: ProductDetailSidebarFact[];
    trustBadges: ProductDetailCmsCard[];
  };
  tocItems: ProductDetailTocItem[];
  layoutSections: ProductDetailLayoutSection[];
  relatedIngredients: {
    name: string;
    slug?: string;
    benefit?: string;
    image?: string;
    category?: string;
    scientificName?: string | null;
  }[];
  relatedIngredientsTitle: string;
  relatedIngredientsSubtitle: string;
  relatedArticles: {
    slug?: string;
    title: string;
    description: string;
    category: string;
    categorySlug?: string;
    readingTime: string;
    image: string;
  }[];
  relatedArticlesTitle: string;
  relatedArticlesSubtitle: string;
  healthNeeds: {
    label: string;
    slug?: string;
    description: string;
  }[];
  healthNeedsTitle: string;
  healthNeedsSubtitle: string;
  related: string[];
  compareTitle: string;
  compareSubtitle: string;
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
  relatedProductsTitle: string;
  relatedProductsSubtitle: string;
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
  expertAttribution: ExpertAttribution;
};
