import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { ProductCardData } from "@/components/product/ProductCard";
import {
  blogToCard,
  createCategoryMap,
  onlyPublished,
  productToCard,
} from "@/lib/live-data";
import type { Blog, Category, Expert, Ingredient, Product } from "@/lib/database/types";
import { ExpertsService } from "@/services/experts.service";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { ProductService } from "@/services/product.service";

export type ExpertContentStats = {
  ingredientGuides: number;
  productReviews: number;
  blogArticles: number;
  healthGoalPages: number;
  totalReviewed: number;
};

export type ExpertDirectoryItem = {
  expert: Expert;
  stats: ExpertContentStats;
};

export type ExpertPublicProfileData = {
  expert: Expert;
  stats: ExpertContentStats;
  relatedProducts: ProductCardData[];
  relatedIngredients: Ingredient[];
  relatedBlogs: BlogPostCard[];
};

function isExpertLinkedToRecord(
  expert: Expert,
  record: { author_id?: string | null; reviewer_id?: string | null },
) {
  return Boolean(
    (expert.linked_author_id && record.author_id === expert.linked_author_id) ||
      (expert.linked_reviewer_id && record.reviewer_id === expert.linked_reviewer_id),
  );
}

function buildStats(
  expert: Expert,
  products: Product[],
  blogs: Blog[],
  ingredients: Ingredient[],
  categories: Category[],
): ExpertContentStats {
  const relatedProducts = products.filter((product) => isExpertLinkedToRecord(expert, product));
  const relatedBlogs = blogs.filter((blog) => isExpertLinkedToRecord(expert, blog));
  const relatedIngredients = ingredients.filter((ingredient) =>
    isExpertLinkedToRecord(expert, ingredient),
  );

  const categoryIds = new Set(
    [...relatedProducts, ...relatedBlogs]
      .map((record) => record.category_id)
      .filter((categoryId): categoryId is string => Boolean(categoryId)),
  );
  const healthGoalPages = categories.filter((category) => categoryIds.has(category.id)).length;

  return {
    ingredientGuides: relatedIngredients.length,
    productReviews: relatedProducts.length,
    blogArticles: relatedBlogs.length,
    healthGoalPages,
    totalReviewed:
      relatedIngredients.length + relatedProducts.length + relatedBlogs.length + healthGoalPages,
  };
}

async function getPublishedContentSets() {
  const [products, categories, blogs, ingredients] = await Promise.all([
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
    new BlogService().getAllBlogs(),
    new IngredientService().getAllIngredients(),
  ]);

  const publishedProducts = onlyPublished(products);
  const publishedCategories = onlyPublished(categories);
  const publishedBlogs = onlyPublished(blogs);
  const publishedIngredients = onlyPublished(ingredients);

  return {
    publishedProducts,
    publishedCategories,
    publishedBlogs,
    publishedIngredients,
    categoryMap: createCategoryMap(publishedCategories),
  };
}

export async function getExpertsDirectoryItems({
  featuredOnly = false,
}: {
  featuredOnly?: boolean;
} = {}): Promise<ExpertDirectoryItem[]> {
  try {
    const expertsService = new ExpertsService();
    const experts = featuredOnly
      ? await expertsService.safeGetFeaturedExperts()
      : await expertsService.safeGetActiveExperts();

    if (!experts.length) {
      return [];
    }

    const { publishedProducts, publishedCategories, publishedBlogs, publishedIngredients } =
      await getPublishedContentSets();

    return experts.map((expert) => ({
      expert,
      stats: buildStats(
        expert,
        publishedProducts,
        publishedBlogs,
        publishedIngredients,
        publishedCategories,
      ),
    }));
  } catch {
    return [];
  }
}

export async function getExpertPublicProfileData(
  slug: string,
): Promise<ExpertPublicProfileData | null> {
  try {
    const expertsService = new ExpertsService();
    const expert = await expertsService.getExpertBySlug(slug).catch(() => null);

    if (!expert || expert.status !== "active") {
      return null;
    }

    const {
      publishedProducts,
      publishedCategories,
      publishedBlogs,
      publishedIngredients,
      categoryMap,
    } = await getPublishedContentSets();

    const stats = buildStats(
      expert,
      publishedProducts,
      publishedBlogs,
      publishedIngredients,
      publishedCategories,
    );

    const relatedProducts = publishedProducts
      .filter((product) => isExpertLinkedToRecord(expert, product))
      .slice(0, 2)
      .map((product, index) => productToCard(product, categoryMap, index));

    const relatedIngredients = publishedIngredients
      .filter((ingredient) => isExpertLinkedToRecord(expert, ingredient))
      .slice(0, 2);

    const relatedBlogs = publishedBlogs
      .filter((blog) => isExpertLinkedToRecord(expert, blog))
      .slice(0, 2)
      .map((blog) => blogToCard(blog, categoryMap));

    return {
      expert,
      stats,
      relatedProducts,
      relatedIngredients,
      relatedBlogs,
    };
  } catch {
    return null;
  }
}
