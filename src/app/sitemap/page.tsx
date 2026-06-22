import type { Metadata } from "next";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { Navbar } from "@/components/navbar/Navbar";
import { HtmlSitemapClient } from "@/components/seo/HtmlSitemapClient";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getSitemapCollections } from "@/lib/seo/sitemap-data";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Static, "sitemap", {
    title: "HTML Sitemap | Suppriva",
    description:
      "Search and browse published categories, ingredients, products, and blog pages from the Suppriva HTML sitemap.",
    canonicalPath: "/sitemap",
  });
}

export default async function HtmlSitemapPage() {
  const collections = await getSitemapCollections();
  const linkedItems = [
    ...collections.categories,
    ...collections.ingredients,
    ...collections.products,
    ...collections.blogs,
  ].map((item) => ({
    name: item.title,
    path: item.path,
  }));

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug="sitemap"
        schema={[
          buildCollectionPageJsonLd({
            title: "Suppriva HTML Sitemap",
            description:
              "Searchable HTML sitemap for Suppriva categories, ingredients, products, and blog pages.",
            path: "/sitemap",
            items: linkedItems,
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "HTML Sitemap", path: "/sitemap" },
          ]),
        ]}
      />
      <Navbar />
      <HtmlSitemapClient collections={collections} />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}

