import type { MetadataRoute } from "next";
import { ContentStatus } from "@/lib/database/constants";
import type { Blog, Category, Ingredient, Product, Timestamp } from "@/lib/database/types";
import { legalFooterLinks } from "@/lib/legal-pages";
import { buildProductPath } from "@/lib/products/url";
import { absoluteUrl } from "@/lib/seo/metadata";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { ProductService } from "@/services/product.service";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export type SitemapLinkItem = {
  title: string;
  path: string;
  description: string;
  updatedAt?: Timestamp | Date | null;
  priority: number;
  changeFrequency: ChangeFrequency;
};

export type SitemapCollections = {
  staticPages: SitemapLinkItem[];
  categories: SitemapLinkItem[];
  ingredients: SitemapLinkItem[];
  products: SitemapLinkItem[];
  blogs: SitemapLinkItem[];
  comparisonPages: SitemapLinkItem[];
};

function isPublishedRecord<T extends { status: ContentStatus; deleted_at: Timestamp | null }>(
  item: T,
) {
  return item.status === ContentStatus.Published && !item.deleted_at;
}

function sortAlphabetically<T extends { title: string }>(items: T[]) {
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}

function buildStaticPages(): SitemapLinkItem[] {
  const staticPages: SitemapLinkItem[] = [
    {
      title: "Home",
      path: "/",
      description: "Suppriva homepage.",
      priority: 1,
      changeFrequency: "daily",
      updatedAt: new Date(),
    },
    {
      title: "Products",
      path: "/products",
      description: "Browse live supplement products.",
      priority: 0.8,
      changeFrequency: "weekly",
      updatedAt: new Date(),
    },
    {
      title: "Ingredients",
      path: "/ingredients",
      description: "Browse live ingredient profiles.",
      priority: 0.9,
      changeFrequency: "weekly",
      updatedAt: new Date(),
    },
    {
      title: "Categories",
      path: "/categories",
      description: "Browse live wellness categories.",
      priority: 0.9,
      changeFrequency: "weekly",
      updatedAt: new Date(),
    },
    {
      title: "Blogs",
      path: "/blogs",
      description: "Browse live wellness articles.",
      priority: 0.8,
      changeFrequency: "monthly",
      updatedAt: new Date(),
    },
    {
      title: "Search",
      path: "/search",
      description: "Search supplements, ingredients, categories, and blogs.",
      priority: 0.7,
      changeFrequency: "daily",
      updatedAt: new Date(),
    },
    {
      title: "HTML Sitemap",
      path: "/sitemap",
      description: "Searchable HTML sitemap for Suppriva.",
      priority: 0.7,
      changeFrequency: "weekly",
      updatedAt: new Date(),
    },
    ...legalFooterLinks.map((link) => ({
      title: link.label,
      path: link.href,
      description: `${link.label} page.`,
      priority: 0.4,
      changeFrequency: "yearly" as const,
      updatedAt: new Date(),
    })),
  ];

  return sortAlphabetically(staticPages);
}

function buildCategoryEntries(categories: Category[]): SitemapLinkItem[] {
  return sortAlphabetically(
    categories
      .filter(isPublishedRecord)
      .map((category) => ({
        title: category.title,
        path: `/category/${category.slug}`,
        description:
          category.seo_description ||
          category.description ||
          `Explore ${category.title.toLowerCase()} supplements and wellness guides.`,
        priority: 0.9,
        changeFrequency: "weekly" as const,
        updatedAt: category.updated_at || category.created_at,
      })),
  );
}

function buildIngredientEntries(ingredients: Ingredient[]): SitemapLinkItem[] {
  return sortAlphabetically(
    ingredients
      .filter(isPublishedRecord)
      .map((ingredient) => ({
        title: ingredient.name,
        path: `/ingredient/${ingredient.slug}`,
        description:
          ingredient.seo_description ||
          ingredient.short_description ||
          ingredient.full_description ||
          `Research ${ingredient.name} on Suppriva.`,
        priority: 0.9,
        changeFrequency: "weekly" as const,
        updatedAt: ingredient.updated_at || ingredient.created_at,
      })),
  );
}

function buildProductEntries(
  products: Product[],
  categories: Category[],
): SitemapLinkItem[] {
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return sortAlphabetically(
    products
      .filter(isPublishedRecord)
      .map((product) => {
        const category = product.category_id ? categoryById.get(product.category_id) : null;

        return {
          title: product.title || product.name,
          path: buildProductPath(product.slug, category?.slug),
          description:
            product.seo_description ||
            product.short_description ||
            product.full_description ||
            `Explore ${product.title || product.name} on Suppriva.`,
          priority: 0.8,
          changeFrequency: "weekly" as const,
          updatedAt: product.updated_at || product.published_at || product.created_at,
        };
      }),
  );
}

function buildBlogEntries(blogs: Blog[]): SitemapLinkItem[] {
  return sortAlphabetically(
    blogs
      .filter(isPublishedRecord)
      .map((blog) => ({
        title: blog.title,
        path: `/blog/${blog.slug}`,
        description:
          blog.seo_description || blog.excerpt || `Read ${blog.title} on Suppriva.`,
        priority: 0.8,
        changeFrequency: "monthly" as const,
        updatedAt: blog.updated_at || blog.published_at || blog.created_at,
      })),
  );
}

export async function getSitemapCollections(): Promise<SitemapCollections> {
  const [products, categories, blogs, ingredients] = await Promise.all([
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
    new BlogService().getAllBlogs(),
    new IngredientService().getPublishedIngredients(),
  ]);

  const publishedCategories = categories.filter(isPublishedRecord);

  return {
    staticPages: buildStaticPages(),
    categories: buildCategoryEntries(categories),
    ingredients: buildIngredientEntries(ingredients),
    products: buildProductEntries(products, publishedCategories),
    blogs: buildBlogEntries(blogs),
    comparisonPages: [],
  };
}

export function buildXmlSitemapEntries(data: SitemapCollections): MetadataRoute.Sitemap {
  const entries = [
    ...data.staticPages,
    ...data.categories,
    ...data.ingredients,
    ...data.products,
    ...data.blogs,
    ...data.comparisonPages,
  ];

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}

