import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { SearchPageTemplate } from "@/components/search/SearchPageTemplate";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { ProductService } from "@/services/product.service";
import { buildSearchResults, onlyPublished } from "@/lib/live-data";
import { buildBreadcrumbJsonLd, buildWebsiteJsonLd } from "@/lib/seo/structured-data";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return buildSeoMetadata(PageType.Search, "search", {
    title: q
      ? `Search ${q} | Suppriva`
      : "Search Supplements & Wellness Guides | Suppriva",
    description:
      "Search premium supplements, health guides, wellness articles, and supplement categories on Suppriva.",
    canonicalPath: "/search",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const [products, categories, blogs, ingredients] = await Promise.all([
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
    new BlogService().getAllBlogs(),
    new IngredientService().getAllIngredients(),
  ]);
  const publishedProducts = onlyPublished(products);
  const publishedCategories = onlyPublished(categories);
  const publishedBlogs = onlyPublished(blogs);
  const results = buildSearchResults(
    publishedProducts,
    publishedCategories,
    publishedBlogs,
    ingredients,
  );
  const suggestions = publishedCategories.slice(0, 8).map((category) => category.title);
  const popular = [
    ...publishedProducts.slice(0, 5).map((product) => product.title || product.name),
    ...ingredients.slice(0, 3).map((ingredient) => ingredient.name),
    ...publishedCategories.slice(0, 3).map((category) => category.title),
  ].slice(0, 8);

  return (
    <>
      <JsonLdScript
        pageType={PageType.Search}
        pageSlug="search"
        schema={[
          buildWebsiteJsonLd(),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Search", path: "/search" },
          ]),
        ]}
      />
      <Navbar />
      <SearchPageTemplate
        query={q ?? ""}
        results={results}
        suggestions={suggestions}
        popular={popular}
      />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
