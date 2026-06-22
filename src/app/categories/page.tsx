import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { CategoriesListingClient } from "@/components/category/CategoriesListingClient";
import { CategoryService } from "@/services/category.service";
import { onlyPublished } from "@/lib/live-data";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Static, "categories", {
    title: "Categories | Suppriva",
    description:
      "Browse wellness categories organized around health goals, lifestyle needs, and everyday wellness support.",
    canonicalPath: "/categories",
  });
}

export default async function CategoriesPage() {
  const categories = onlyPublished(await new CategoryService().getAllCategories()).map(
    (category) => ({
      title: category.title,
      slug: category.slug,
    }),
  );

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug="categories"
        schema={[
          buildCollectionPageJsonLd({
            title: "Explore Wellness Categories",
            description:
              "Browse wellness categories organized around health goals, lifestyle needs, and everyday wellness support.",
            path: "/categories",
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
          ]),
        ]}
      />
      <Navbar />
      <main>
        <SectionWrapper id="categories" tone="white">
          <SectionTitle
            title="Explore Wellness Categories"
            subtitle="Browse wellness categories organized around health goals, lifestyle needs, and everyday wellness support."
          />
          <CategoriesListingClient categories={categories} />
        </SectionWrapper>
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
