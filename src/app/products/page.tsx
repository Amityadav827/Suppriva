import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { CategoryProductGrid } from "@/components/category-page/CategoryProductGrid";
import { CategoryService } from "@/services/category.service";
import { ProductService } from "@/services/product.service";
import { createCategoryMap, onlyPublished, productToCategoryProduct } from "@/lib/live-data";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { PageType } from "@/lib/database/constants";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Static, "products", {
    title: "Products | Suppriva",
    description: "Browse live Suppriva supplement products from the database.",
    canonicalPath: "/products",
  });
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
  ]);
  const categoryMap = createCategoryMap(onlyPublished(categories));
  const productCards = onlyPublished(products).map((product, index) =>
    productToCategoryProduct(product, categoryMap, index),
  );

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug="products"
        schema={[
          buildCollectionPageJsonLd({
            title: "All Supplements",
            description: "Every product vetted for ingredients, safety, and value — so you don't have to.",
            path: "/products",
            items: productCards.map((product) => ({
              name: product.name,
              path: product.href || `/product/${product.slug}`,
            })),
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
          ]),
        ]}
      />
      <Navbar />
      <main>
        <SectionWrapper id="products" tone="white">
          <SectionTitle
            title="All Supplements"
            subtitle="Every product vetted for ingredients, safety, and value — so you don't have to."
          />
          <CategoryProductGrid products={productCards} />
        </SectionWrapper>
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
