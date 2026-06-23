import type { CategoryProduct } from "@/lib/category-data";
import type {
  Author,
  ExpertAttribution,
  FAQItem,
  Ingredient,
  Reviewer,
} from "@/lib/database/types";
import { getExpertProfilePath, type ExpertRole } from "@/lib/eeat/shared";
import type { ProductDetail } from "@/lib/product-data";
import {
  absoluteUrl,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_SOCIAL_LINKS,
  SITE_URL,
} from "@/lib/seo/metadata";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type LinkedItem = {
  name: string;
  path: string;
};

type BlogSchemaInput = {
  slug: string;
  title: string;
  description: string;
  image?: string | null;
  author: Author;
  reviewer?: Reviewer | null;
  datePublished?: string | null;
  dateModified?: string | null;
};

type ExpertPerson = Author | Reviewer;

function buildItemListElement(items: LinkedItem[]) {
  return items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: absoluteUrl(item.path),
  }));
}

function cleanTextList(values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).filter((value): value is string => Boolean(value));
}

function buildPersonReference(profile?: ExpertPerson | null, role: ExpertRole = "author") {
  if (!profile) {
    return null;
  }

  const sameAs = [profile.linkedin_url, profile.website_url].filter(Boolean);

  return {
    "@type": "Person",
    name: profile.name,
    url: absoluteUrl(getExpertProfilePath(role, profile.slug)),
    ...(profile.photo_url ? { image: absoluteUrl(profile.photo_url) } : {}),
    ...(profile.designation ? { jobTitle: profile.designation } : {}),
    ...(profile.qualification ? { hasCredential: profile.qualification } : {}),
    ...(profile.bio ? { description: profile.bio } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildPersonJsonLd(profile: ExpertPerson, role: ExpertRole) {
  const sameAs = [profile.linkedin_url, profile.website_url].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: absoluteUrl(getExpertProfilePath(role, profile.slug)),
    ...(profile.photo_url ? { image: absoluteUrl(profile.photo_url) } : {}),
    ...(profile.designation ? { jobTitle: profile.designation } : {}),
    ...(profile.qualification ? { hasCredential: profile.qualification } : {}),
    ...(profile.experience_years
      ? {
          description: `${profile.bio || profile.name} ${profile.experience_years}+ years of experience.`,
        }
      : profile.bio
        ? { description: profile.bio }
        : {}),
    ...(profile.email ? { email: profile.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

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
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
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
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(SITE_LOGO_PATH),
    ...(SITE_SOCIAL_LINKS.length ? { sameAs: SITE_SOCIAL_LINKS } : {}),
  };
}

export function buildProductJsonLd(product: ProductDetail) {
  const image = product.image || product.gallery?.[0];
  const offerUrl = product.affiliateUrl || product.path;
  const author = buildPersonReference(product.expertAttribution.author, "author");
  const reviewer = buildPersonReference(product.expertAttribution.reviewer, "reviewer");

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    url: absoluteUrl(product.path),
    ...(image ? { image: [absoluteUrl(image)] } : {}),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    ...(author ? { author } : {}),
    ...(reviewer ? { reviewedBy: reviewer } : {}),
    ...(product.ratingValue
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.ratingValue,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(offerUrl),
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

export function buildArticleJsonLd(article: BlogSchemaInput) {
  const author = buildPersonReference(article.author, "author");
  const reviewer = buildPersonReference(article.reviewer, "reviewer");

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    ...(article.image ? { image: [absoluteUrl(article.image)] } : {}),
    ...(author ? { author } : {}),
    ...(reviewer ? { reviewedBy: reviewer } : {}),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE_LOGO_PATH),
      },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${article.slug}`),
    ...(article.datePublished ? { datePublished: article.datePublished } : {}),
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
  };
}

export function buildIngredientDefinedTermJsonLd(
  ingredient: Ingredient,
  relatedProducts: CategoryProduct[] = [],
  attribution?: Partial<ExpertAttribution>,
) {
  const description =
    ingredient.seo_description ||
    ingredient.short_description ||
    ingredient.full_description ||
    ingredient.overview_content ||
    `Suppriva ingredient profile for ${ingredient.name}.`;
  const benefits = cleanTextList([
    ...ingredient.benefits,
    ...((Array.isArray(ingredient.benefits_json)
      ? ingredient.benefits_json
          .map((entry) =>
            typeof entry === "object" &&
            entry !== null &&
            "title" in entry &&
            typeof entry.title === "string"
              ? entry.title
              : null,
          )
      : []) as Array<string | null>),
  ]).slice(0, 8);
  const author = buildPersonReference(attribution?.author, "author");
  const reviewer = buildPersonReference(attribution?.reviewer, "reviewer");

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: ingredient.name,
    termCode: ingredient.slug,
    url: absoluteUrl(`/ingredient/${ingredient.slug}`),
    inDefinedTermSet: absoluteUrl("/ingredients"),
    description,
    ...(author ? { author } : {}),
    ...(reviewer ? { reviewedBy: reviewer } : {}),
    ...(ingredient.scientific_name
      ? { alternateName: ingredient.scientific_name }
      : {}),
    ...(benefits.length
      ? {
          additionalProperty: benefits.map((benefit) => ({
            "@type": "PropertyValue",
            name: "Benefit",
            value: benefit,
          })),
        }
      : {}),
    ...(relatedProducts.length
      ? {
          subjectOf: relatedProducts.slice(0, 8).map((product) => ({
            "@type": "WebPage",
            name: product.name,
            url: absoluteUrl(product.href || `/product/${product.slug}`),
          })),
        }
      : {}),
  };
}

export function buildMedicalWebPageJsonLd(
  ingredient: Ingredient,
  attribution?: Partial<ExpertAttribution>,
) {
  const image = ingredient.image_url || ingredient.featured_image;
  const author = buildPersonReference(attribution?.author, "author");
  const reviewer = buildPersonReference(attribution?.reviewer, "reviewer");

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
    ...(author ? { author } : {}),
    ...(reviewer ? { reviewedBy: reviewer } : {}),
    ...(image
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: absoluteUrl(image),
          },
        }
      : {}),
    about: {
      "@type": "MedicalEntity",
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
      name: SITE_NAME,
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
  items = [],
}: {
  title: string;
  description: string;
  path: string;
  items?: LinkedItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: absoluteUrl(path),
    ...(items.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: buildItemListElement(items),
          },
        }
      : {}),
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
      name: SITE_NAME,
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
