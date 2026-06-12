import type { BlogArticle } from "@/lib/blog-data";
import type { FAQItem, Ingredient } from "@/lib/database/types";
import type { ProductDetail } from "@/lib/product-data";
import { absoluteUrl, SITE_URL } from "@/lib/seo/metadata";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Suppriva",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Suppriva",
    url: SITE_URL,
    logo: absoluteUrl("/assets/hero-supplements.webp"),
  };
}

export function buildProductJsonLd(product: ProductDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    image: absoluteUrl(product.image || product.gallery?.[0]),
    brand: {
      "@type": "Brand",
      name: product.name,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: 128,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
    },
  };
}

export function buildArticleJsonLd(article: BlogArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    image: absoluteUrl(article.image),
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Suppriva",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/assets/hero-supplements.webp"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${article.slug}`),
  };
}

export function buildIngredientJsonLd(ingredient: Ingredient) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ingredient.seo_title || ingredient.meta_title || ingredient.name,
    description:
      ingredient.seo_description ||
      ingredient.meta_description ||
      ingredient.short_description ||
      `Suppriva ingredient profile for ${ingredient.name}.`,
    image: absoluteUrl(ingredient.image_url || ingredient.featured_image),
    author: {
      "@type": "Organization",
      name: "Suppriva",
    },
    publisher: {
      "@type": "Organization",
      name: "Suppriva",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/assets/hero-supplements.webp"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/ingredient/${ingredient.slug}`),
  };
}

export function buildMedicalWebPageJsonLd(ingredient: Ingredient) {
  const image = ingredient.image_url || ingredient.featured_image;

  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: ingredient.seo_title || ingredient.name,
    description:
      ingredient.seo_description ||
      ingredient.short_description ||
      ingredient.full_description ||
      `Suppriva ingredient profile for ${ingredient.name}.`,
    url: absoluteUrl(`/ingredient/${ingredient.slug}`),
    lastReviewed: ingredient.updated_at,
    ...(image
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: absoluteUrl(image),
          },
        }
      : {}),
    about: {
      "@type": "Substance",
      name: ingredient.name,
      ...(ingredient.scientific_name
        ? { alternateName: ingredient.scientific_name }
        : {}),
      ...(ingredient.short_description
        ? { description: ingredient.short_description }
        : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "Suppriva",
      url: SITE_URL,
    },
  };
}

export function buildFaqJsonLd(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildCollectionPageJsonLd({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: absoluteUrl(path),
  };
}

export function buildWebPageJsonLd({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    publisher: {
      "@type": "Organization",
      name: "Suppriva",
      url: SITE_URL,
    },
  };
}

export function buildContactPageJsonLd({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: title,
    description,
    url: absoluteUrl(path),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@suppriva.com",
    },
  };
}
