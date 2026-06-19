import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { JsonValue } from "@/lib/database/types";
import { ProductDetailTemplate } from "@/components/product-detail/ProductDetailTemplate";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { ProductService } from "@/services/product.service";
import { blogToCard, createCategoryMap, onlyPublished, productToDetail } from "@/lib/live-data";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildProductJsonLd,
} from "@/lib/seo/structured-data";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveRelatedArticles(
  searchTerms: string[],
  blogs: Awaited<ReturnType<BlogService["getAllBlogs"]>>,
  categoryMap: ReturnType<typeof createCategoryMap>,
): BlogPostCard[] {
  const normalizedTerms = searchTerms
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);

  return onlyPublished(blogs)
    .filter((blog) => {
      const categoryTitle = blog.category_id ? categoryMap.get(blog.category_id)?.title ?? "" : "";
      const haystack = [
        blog.title,
        blog.excerpt ?? "",
        blog.seo_description ?? "",
        categoryTitle,
        blog.tags.join(" "),
        isRecord(blog.content) && typeof blog.content.body === "string" ? blog.content.body : "",
      ]
        .join(" ")
        .toLowerCase();

      return normalizedTerms.some((term) => haystack.includes(term));
    })
    .slice(0, 4)
    .map((blog) => blogToCard(blog, categoryMap));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const productService = new ProductService();

  try {
    const product = await productService.getProductBySlug(slug);
    if (product.status !== "published") {
      throw new Error("Product not published.");
    }

    return {
      ...(await buildSeoMetadata(PageType.Product, slug, {
        title: `${product.seo_title || product.title || product.name} Review | Suppriva`,
        description:
          product.seo_description ||
          product.short_description ||
          "Premium Suppriva supplement review.",
        canonicalPath: `/product/${slug}`,
        image: product.image || product.gallery?.[0],
      })),
    };
  } catch {
    return {
      title: "Product Not Found | Suppriva",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products, categories, blogs] = await Promise.all([
    new ProductService().getProductBySlug(slug).catch(() => null),
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
    new BlogService().getAllBlogs(),
  ]);

  if (!product || product.status !== "published") {
    notFound();
  }
  const publishedProducts = onlyPublished(products);
  const publishedCategories = onlyPublished(categories);
  const categoryMap = createCategoryMap(publishedCategories);
  const linkedIngredients = await new IngredientService().getIngredientsForProduct(product.id);
  const baseProductDetail = productToDetail(
    product,
    publishedProducts,
    categoryMap,
    linkedIngredients,
  );
  const relatedArticles = resolveRelatedArticles(
    [
      baseProductDetail.name,
      baseProductDetail.category,
      ...linkedIngredients.map((ingredient) => ingredient.name),
      ...linkedIngredients.map((ingredient) => ingredient.scientific_name ?? ""),
    ],
    blogs,
    categoryMap,
  );
  const healthNeeds = publishedCategories
    .slice(0, 8)
    .map((category) => ({
      label: category.title,
      slug: category.slug,
      description:
        category.description ||
        category.seo_description ||
        `Explore ${category.title.toLowerCase()} supplements and guides.`,
    }));
  const productDetail = {
    ...baseProductDetail,
    relatedArticles,
    healthNeeds,
  };
  const faqs = productDetail.faqs.filter((faq) => faq.question?.trim() && faq.answer?.trim());

  return (
    <>
      <JsonLdScript
        pageType={PageType.Product}
        pageSlug={slug}
        schema={[
          buildProductJsonLd(productDetail),
          ...(faqs.length ? [buildFaqJsonLd(faqs)] : []),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: productDetail.name, path: `/product/${slug}` },
          ]),
        ]}
      />
      <Navbar />
      <ProductDetailTemplate product={productDetail} />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
