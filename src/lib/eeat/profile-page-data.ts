import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { ProductCardData } from "@/components/product/ProductCard";
import type { Author, Ingredient, Reviewer } from "@/lib/database/types";
import {
  blogToCard,
  createCategoryMap,
  onlyPublished,
  productToCard,
} from "@/lib/live-data";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { AuthorsService, ReviewersService } from "@/services/expert-profiles.service";
import { IngredientService } from "@/services/ingredient.service";
import { ProductService } from "@/services/product.service";
import type { ExpertRole } from "./shared";

type ExpertProfile = Author | Reviewer;

export type ExpertProfilePageData = {
  role: ExpertRole;
  profile: ExpertProfile;
  products: ProductCardData[];
  ingredients: Ingredient[];
  blogs: BlogPostCard[];
  counts: {
    products: number;
    ingredients: number;
    blogs: number;
  };
};

export async function getExpertProfilePageData(
  role: ExpertRole,
  slug: string,
): Promise<ExpertProfilePageData | null> {
  const profileService = role === "author" ? new AuthorsService() : new ReviewersService();
  const ingredientService = new IngredientService();

  const profile = await profileService.getProfileBySlug(slug).catch(() => null);

  if (!profile || !profile.is_active) {
    return null;
  }

  const [products, ingredients, blogs, categories] = await Promise.all([
    new ProductService().getAllProducts(),
    ingredientService.getPublishedIngredients(),
    new BlogService().getAllBlogs(),
    new CategoryService().getAllCategories(),
  ]);

  const categoryMap = createCategoryMap(onlyPublished(categories));
  const publishedProducts = onlyPublished(products).filter((product) =>
    role === "author" ? product.author_id === profile.id : product.reviewer_id === profile.id,
  );
  const publishedBlogs = onlyPublished(blogs).filter((blog) =>
    role === "author" ? blog.author_id === profile.id : blog.reviewer_id === profile.id,
  );
  const publishedIngredients = ingredients.filter((ingredient) =>
    role === "author"
      ? ingredient.author_id === profile.id
      : ingredient.reviewer_id === profile.id,
  );

  return {
    role,
    profile,
    products: publishedProducts.slice(0, 6).map((product, index) =>
      productToCard(product, categoryMap, index),
    ),
    ingredients: publishedIngredients.slice(0, 6),
    blogs: publishedBlogs.slice(0, 6).map((blog) => blogToCard(blog, categoryMap)),
    counts: {
      products: publishedProducts.length,
      ingredients: publishedIngredients.length,
      blogs: publishedBlogs.length,
    },
  };
}

