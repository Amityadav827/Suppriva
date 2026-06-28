import type { BlogPostCard } from "@/components/blog/BlogCard";
import { resolveExpertAttribution } from "@/lib/eeat/server";
import type { Blog, JsonValue, Product } from "@/lib/database/types";
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

function resolveManualRelatedArticles(
  product: Product,
  blogs: Blog[],
  categoryMap: ReturnType<typeof createCategoryMap>,
): BlogPostCard[] {
  const blogMap = new Map(onlyPublished(blogs).map((blog) => [blog.id, blog]));
  const manualRelations = [...(product.related_blog_relations ?? [])]
    .filter((relation) => relation.is_active !== false)
    .sort((first, second) => first.display_order - second.display_order);

  return manualRelations
    .map((relation) => {
      const blog = blogMap.get(relation.blog_id);

      if (!blog) {
        return null;
      }

      const card = blogToCard(blog, categoryMap);

      return {
        ...card,
        title: relation.title_override || card.title,
        description: relation.description_override || card.description,
      };
    })
    .filter(Boolean) as BlogPostCard[];
}

export async function getProductPageData(slug: string) {
  const [product, products, categories, blogs, ingredients] = await Promise.all([
    new ProductService().getProductBySlug(slug).catch(() => null),
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
    new BlogService().getAllBlogs(),
    new IngredientService().getAllIngredients(),
  ]);

  if (!product || product.status !== "published") {
    return null;
  }

  const publishedProducts = onlyPublished(products);
  const publishedCategories = onlyPublished(categories);
  const categoryMap = createCategoryMap(publishedCategories);
  const linkedIngredients = await new IngredientService().getIngredientsForProduct(product.id);
  const publishedIngredients = onlyPublished(ingredients);
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
    publishedIngredients,
  );

  const manualRelatedArticles = resolveManualRelatedArticles(product, blogs, categoryMap);
  const relatedArticles = manualRelatedArticles.length
    ? manualRelatedArticles
    : resolveRelatedArticles(
        [
          baseProductDetail.name,
          baseProductDetail.category,
          ...linkedIngredients.map((ingredient) => ingredient.name),
          ...linkedIngredients.map((ingredient) => ingredient.scientific_name ?? ""),
        ],
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
