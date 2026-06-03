import type { MetadataRoute } from "next";
import { ContentStatus } from "@/lib/database/constants";
import { legalFooterLinks } from "@/lib/legal-pages";
import { SITE_URL } from "@/lib/seo/metadata";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { ProductService } from "@/services/product.service";

function toUrl(path: string) {
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/blogs",
    "/categories",
    "/ingredients",
    "/search",
    ...legalFooterLinks.map((link) => link.href),
  ].map((path) => ({
    url: toUrl(path || "/"),
    lastModified: new Date(),
    changeFrequency: path ? "weekly" : "daily",
    priority: path ? 0.8 : 1,
  }));

  const [products, categories, blogs, ingredients] = await Promise.all([
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
    new BlogService().getAllBlogs(),
    new IngredientService().getAllIngredients(),
  ]);

  const productRoutes = products
    .filter((product) => product.status === ContentStatus.Published && !product.deleted_at)
    .map((product) => ({
      url: toUrl(`/product/${product.slug}`),
      lastModified: new Date(product.updated_at || product.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const categoryRoutes = categories
    .filter((category) => category.status === ContentStatus.Published && !category.deleted_at)
    .map((category) => ({
      url: toUrl(`/category/${category.slug}`),
      lastModified: new Date(category.updated_at || category.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const blogRoutes = blogs
    .filter((blog) => blog.status === ContentStatus.Published && !blog.deleted_at)
    .map((blog) => ({
      url: toUrl(`/blog/${blog.slug}`),
      lastModified: new Date(blog.updated_at || blog.published_at || blog.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const ingredientRoutes = ingredients
    .filter((ingredient) => !ingredient.deleted_at)
    .map((ingredient) => ({
      url: toUrl(`/ingredient/${ingredient.slug}`),
      lastModified: new Date(ingredient.updated_at || ingredient.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...blogRoutes,
    ...ingredientRoutes,
  ];
}
