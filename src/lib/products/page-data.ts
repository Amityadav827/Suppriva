import type { BlogPostCard } from "@/components/blog/BlogCard";
import { resolveExpertAttribution } from "@/lib/eeat/server";
import type { JsonValue } from "@/lib/database/types";
import { blogToCard, createCategoryMap, onlyPublished, productToDetail } from "@/lib/live-data";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { ProductService } from "@/services/product.service";

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveRelatedArticles(
  searchTerms: string[],
  categoryId: string | null,
  blogs: Awaited<ReturnType<BlogService["getAllBlogs"]>>,
  categoryMap: ReturnType<typeof createCategoryMap>,
): BlogPostCard[] {
  const normalizedTerms = searchTerms
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  const publishedBlogs = onlyPublished(blogs);

  const matchedBlogs = publishedBlogs
    .filter((blog) => {
      const categoryTitle = blog.category_id ? categoryMap.get(blog.category_id)?.title ?? "" : "";
      const haystack = [
        blog.title,
        blog.excerpt ?? "",
        blog.seo_description ?? "",
        Array.isArray(blog.seo_keywords) ? blog.seo_keywords.join(" ") : "",
        categoryTitle,
        Array.isArray(blog.tags) ? blog.tags.join(" ") : "",
        isRecord(blog.content) && typeof blog.content.body === "string" ? blog.content.body : "",
      ]
        .join(" ")
        .toLowerCase();

      return normalizedTerms.some((term) => haystack.includes(term));
    });

  const categoryFallbackBlogs = categoryId
    ? publishedBlogs.filter((blog) => blog.category_id === categoryId)
    : [];

  const relatedBlogs = [...matchedBlogs, ...categoryFallbackBlogs, ...publishedBlogs].filter(
    (blog, index, list) => list.findIndex((item) => item.id === blog.id) === index,
  );

  return relatedBlogs.slice(0, 4).map((blog) => blogToCard(blog, categoryMap));
}

export async function getProductPageData(slug: string) {
  const [product, products, categories, blogs] = await Promise.all([
    new ProductService().getProductBySlug(slug).catch(() => null),
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
    new BlogService().getAllBlogs(),
  ]);

  if (!product || product.status !== "published") {
    return null;
  }

  const publishedProducts = onlyPublished(products);
  const publishedCategories = onlyPublished(categories);
  const categoryMap = createCategoryMap(publishedCategories);
  const linkedIngredients = onlyPublished(
    await new IngredientService().getIngredientsForProduct(product.id),
  );
  const expertAttribution = await resolveExpertAttribution({
    authorId: product.author_id,
    reviewerId: product.reviewer_id,
    updatedAt: product.updated_at || product.published_at || product.created_at,
  });
  const baseProductDetail = productToDetail(
    product,
    publishedProducts,
    categoryMap,
    expertAttribution,
    linkedIngredients,
  );

  const relatedArticles = resolveRelatedArticles(
    [
      baseProductDetail.name,
      baseProductDetail.category,
      ...linkedIngredients.map((ingredient) => ingredient.name),
      ...linkedIngredients.map((ingredient) => ingredient.scientific_name ?? ""),
    ],
    product.category_id,
    blogs,
    categoryMap,
  );

  const healthNeeds = publishedCategories.map((category) => ({
    label: category.title,
    slug: category.slug,
    description:
      category.description ||
      category.seo_description ||
      `Explore ${category.title.toLowerCase()} supplements and guides.`,
  }));

  return {
    product,
    categoryMap,
    productDetail: {
      ...baseProductDetail,
      relatedArticles,
      healthNeeds,
    },
  };
}
