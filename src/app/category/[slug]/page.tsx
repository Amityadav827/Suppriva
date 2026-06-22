import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { CategoryDetailTemplate } from "@/components/category-page/CategoryDetailTemplate";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { ProductService } from "@/services/product.service";
import { categoryToDetail, onlyPublished } from "@/lib/live-data";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo/structured-data";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryService = new CategoryService();

  try {
    const category = await categoryService.getCategoryBySlug(slug);
    if (category.status !== "published") {
      throw new Error("Category not published.");
    }

    return {
      ...(await buildSeoMetadata(PageType.Category, slug, {
        title: `${category.seo_title || category.title} | Suppriva`,
        description:
          category.seo_description ||
          category.description ||
          "Suppriva premium supplement category.",
        canonicalPath: `/category/${slug}`,
        image: category.image,
      })),
    };
  } catch {
    return {
      title: "Category Not Found | Suppriva",
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, categories, products, blogs] = await Promise.all([
    new CategoryService().getCategoryBySlug(slug).catch(() => null),
    new CategoryService().getAllCategories(),
    new ProductService().getAllProducts(),
    new BlogService().getAllBlogs(),
  ]);

  if (!category || category.status !== "published") {
    notFound();
  }
  const publishedCategories = onlyPublished(categories);
  const publishedProducts = onlyPublished(products);
  const publishedBlogs = onlyPublished(blogs);
  const categoryDetail = categoryToDetail(
    category,
    publishedCategories,
    publishedProducts,
    publishedBlogs,
  );

  return (
    <>
      <JsonLdScript
        pageType={PageType.Category}
        pageSlug={slug}
        schema={[
          buildCollectionPageJsonLd({
            title: categoryDetail.title,
            description: categoryDetail.subtitle,
            path: `/category/${slug}`,
            items: categoryDetail.products.map((product) => ({
              name: product.name,
              path: product.href || `/product/${product.slug}`,
            })),
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
            { name: categoryDetail.title, path: `/category/${slug}` },
          ]),
        ]}
      />
      <Navbar />
      <CategoryDetailTemplate category={categoryDetail} />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
