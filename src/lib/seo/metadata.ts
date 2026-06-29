import type { Metadata } from "next";
import { PageType } from "@/lib/database/constants";
import type { JsonValue, SEO } from "@/lib/database/types";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site-config";
import { SeoService } from "@/services/seo.service";

export {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_SOCIAL_LINKS,
  SITE_LOGO_PATH,
  SITE_URL,
} from "@/lib/seo/site-config";

export type SeoMetadataFallback = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string | null;
  imageAlt?: string | null;
  openGraphTitle?: string | null;
  openGraphDescription?: string | null;
  openGraphImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  noindex?: boolean;
  nofollow?: boolean;
  type?: "website" | "article";
};

export function absoluteUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) {
    return `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export async function getSeoRecordSafe(pageType: PageType, pageSlug: string) {
  try {
    const seoService = new SeoService();

    return seoService.getSeoByPage(pageType, pageSlug);
  } catch {
    return null;
  }
}

export async function buildSeoMetadata(
  pageType: PageType,
  pageSlug: string,
  fallback: SeoMetadataFallback,
): Promise<Metadata> {
  const seo = await getSeoRecordSafe(pageType, pageSlug);
  const title = seo?.meta_title || fallback.title;
  const description = seo?.meta_description || fallback.description;
  const canonical = seo?.canonical_url || fallback.canonicalPath || "/";
  const canonicalUrl = absoluteUrl(canonical);
  const ogTitle = fallback.openGraphTitle || title;
  const ogDescription = fallback.openGraphDescription || description;
  const twitterTitle = fallback.twitterTitle || ogTitle;
  const twitterDescription = fallback.twitterDescription || ogDescription;
  const imageUrl = absoluteUrl(fallback.openGraphImage || fallback.image || DEFAULT_OG_IMAGE);
  const twitterImageUrl = absoluteUrl(
    fallback.twitterImage || fallback.openGraphImage || fallback.image || DEFAULT_OG_IMAGE,
  );
  const shouldIndex = !fallback.noindex;
  const shouldFollow = !fallback.nofollow;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
    },
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      googleBot: {
        index: shouldIndex,
        follow: shouldFollow,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: fallback.type || "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fallback.imageAlt || ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: [twitterImageUrl],
    },
  };
}

export function hasSchemaJson(seo: SEO | null): seo is SEO {
  if (!seo) {
    return false;
  }

  const schema = seo.schema_json;

  if (schema === null) {
    return false;
  }

  if (Array.isArray(schema)) {
    return schema.length > 0;
  }

  if (typeof schema === "object") {
    return Object.keys(schema).length > 0;
  }

  return true;
}

export function serializeJsonLd(schema: JsonValue) {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
