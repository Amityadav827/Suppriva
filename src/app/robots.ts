import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/product",
          "/ingredients",
          "/ingredient",
          "/categories",
          "/category",
          "/blogs",
          "/blog",
          "/search",
          "/contact",
          "/sitemap",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/api/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
