import type { MetadataRoute } from "next";
import { buildXmlSitemapEntries, getSitemapCollections } from "@/lib/seo/sitemap-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildXmlSitemapEntries(await getSitemapCollections());
}
