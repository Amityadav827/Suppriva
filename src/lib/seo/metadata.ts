import type { Metadata } from "next";
import { PageType } from "@/lib/database/constants";
import type { JsonValue, SEO } from "@/lib/database/types";
import { SeoService } from "@/services/seo.service";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://suppriva.com").replace(
  /\/+$/,
  "",
);
export const DEFAULT_OG_IMAGE = "/assets/hero-supplements-og.jpg";

export type SeoMetadataFallback = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string | null;
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
  const imageUrl = absoluteUrl(fallback.image || DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Suppriva",
      type: fallback.type || "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
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
