import { isAdmin } from "@/lib/auth/admin";
import { AppError } from "@/lib/errors/AppError";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { NewsletterService } from "@/services/newsletter.service";
import { ProductService } from "@/services/product.service";
import { AffiliateClickService } from "@/services/affiliate-click.service";
import { MediaLibraryService } from "@/services/media-library.service";
import { ContentStatus } from "@/lib/database/constants";
import type {
  AffiliateClick,
  Blog,
  Ingredient,
  Product,
} from "@/lib/database/types";

type RecentActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  updatedAt: string;
  status?: string;
};

type EnrichedClick = AffiliateClick & {
  product_title: string;
  source_label: string;
};

function parseSourceLabel(sourcePage: string | null) {
  if (!sourcePage) {
    return "Direct";
  }

  try {
    const parsed = JSON.parse(sourcePage) as {
      page?: string | null;
      referrer?: string | null;
    };
    return parsed.page || parsed.referrer || "Direct";
  } catch {
    return sourcePage;
  }
}

function publishedCount<T extends { status?: string }>(records: T[]) {
  return records.filter((record) => record.status === ContentStatus.Published).length;
}

function uniqueDefined(values: Array<string | null | undefined>) {
  return new Set(values.filter((value): value is string => Boolean(value)));
}

export class DashboardAnalyticsService {
  async getOverview() {
    await this.assertAdmin();

    const [
      products,
      categories,
      blogs,
      ingredients,
      mediaItems,
      affiliateStats,
      newsletterStats,
    ] = await Promise.all([
      new ProductService().getAllProducts(),
      new CategoryService().getAllCategories(),
      new BlogService().getAllBlogs(),
      new IngredientService().getAllIngredients(),
      new MediaLibraryService().listMedia(),
      new AffiliateClickService().getDashboardStats(),
      new NewsletterService().getSubscriberStats(),
    ]);

    const productMap = new Map(products.map((product) => [product.id, product]));
    const recentClicks: EnrichedClick[] = affiliateStats.recentClicks.map((click) => ({
      ...click,
      product_title: productMap.get(click.product_id)?.title || productMap.get(click.product_id)?.name || "Unknown product",
      source_label: parseSourceLabel(click.source_page),
    }));

    const topProducts = affiliateStats.topProducts.map((entry) => ({
      product_id: entry.product_id,
      product_title:
        productMap.get(entry.product_id)?.title ||
        productMap.get(entry.product_id)?.name ||
        "Unknown product",
      clicks: entry.clicks,
    }));

    const recentProducts = this.buildRecentProductActivity(products);
    const recentBlogs = this.buildRecentBlogActivity(blogs);
    const recentIngredients = this.buildRecentIngredientActivity(ingredients);

    return {
      summary: {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalBlogs: blogs.length,
        totalIngredients: ingredients.length,
        newsletterSubscribers: newsletterStats.totalSubscribers,
        affiliateClicks: affiliateStats.totalClicks,
        publishedContent:
          publishedCount(products) +
          publishedCount(categories) +
          publishedCount(blogs) +
          publishedCount(ingredients),
      },
      storage: {
        uploadedImagesCount: mediaItems.length,
        categoryImages: uniqueDefined(categories.map((category) => category.image)).size,
        productImages: uniqueDefined(
          products.flatMap((product) => [product.image, ...(product.gallery ?? [])]),
        ).size,
        blogImages: uniqueDefined(
          blogs.flatMap((blog) => {
            const gallery =
              blog.content &&
              typeof blog.content === "object" &&
              !Array.isArray(blog.content) &&
              "gallery" in blog.content &&
              Array.isArray(blog.content.gallery)
                ? blog.content.gallery.filter((item): item is string => typeof item === "string")
                : [];

            return [blog.featured_image, ...gallery];
          }),
        ).size,
        ingredientImages: uniqueDefined(
          ingredients.flatMap((ingredient) => [ingredient.image_url, ingredient.featured_image]),
        ).size,
      },
      affiliate: {
        ...affiliateStats,
        topProducts,
        recentClicks,
      },
      newsletter: newsletterStats,
      recentActivity: {
        products: recentProducts,
        blogs: recentBlogs,
        ingredients: recentIngredients,
        subscribers: newsletterStats.recentSubscribers.slice(0, 5).map((subscriber) => ({
          id: subscriber.id,
          title: subscriber.email,
          subtitle: subscriber.source_page || "Newsletter signup",
          href: "/dashboard",
          updatedAt: subscriber.created_at,
          status: subscriber.status,
        })),
      },
      quickActions: [
        { label: "Add Product", href: "/dashboard/products" },
        { label: "Add Blog", href: "/dashboard/blogs" },
        { label: "Add Category", href: "/dashboard/categories" },
        { label: "Add SEO Record", href: "/dashboard/seo" },
        { label: "Open Media Library", href: "/dashboard/media-library" },
      ],
    };
  }

  private buildRecentProductActivity(products: Product[]): RecentActivityItem[] {
    return products.slice(0, 5).map((product) => ({
      id: product.id,
      title: product.title || product.name,
      subtitle: product.slug,
      href: "/dashboard/products",
      updatedAt: product.updated_at,
      status: product.status,
    }));
  }

  private buildRecentBlogActivity(blogs: Blog[]): RecentActivityItem[] {
    return blogs.slice(0, 5).map((blog) => ({
      id: blog.id,
      title: blog.title,
      subtitle: blog.slug,
      href: "/dashboard/blogs",
      updatedAt: blog.updated_at,
      status: blog.status,
    }));
  }

  private buildRecentIngredientActivity(ingredients: Ingredient[]): RecentActivityItem[] {
    return ingredients.slice(0, 5).map((ingredient) => ({
      id: ingredient.id,
      title: ingredient.name,
      subtitle: ingredient.slug,
      href: "/dashboard/ingredients",
      updatedAt: ingredient.updated_at,
      status: ingredient.status,
    }));
  }

  private async assertAdmin() {
    if (!(await isAdmin())) {
      throw new AppError("Admin access is required.", "ADMIN_REQUIRED", 403);
    }
  }
}
