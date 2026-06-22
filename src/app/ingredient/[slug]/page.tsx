import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { IngredientDetailTemplate, type RelatedIngredientCardData } from "@/components/ingredients/IngredientDetailTemplate";
import { Navbar } from "@/components/navbar/Navbar";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { PageType } from "@/lib/database/constants";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { Ingredient, JsonValue } from "@/lib/database/types";
import { blogToCard, createCategoryMap, onlyPublished, productToCategoryProduct } from "@/lib/live-data";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildIngredientDefinedTermJsonLd,
  buildMedicalWebPageJsonLd,
} from "@/lib/seo/structured-data";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";

type IngredientPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveRelatedIngredients(
  ingredient: Ingredient,
  ingredients: Ingredient[],
): RelatedIngredientCardData[] {
  const seen = new Set<string>();
  const relatedEntries = Array.isArray(ingredient.related_ingredients_json)
    ? ingredient.related_ingredients_json
    : [];

  return relatedEntries
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const slug = typeof entry.slug === "string" ? entry.slug.trim() : "";
      const name = typeof entry.name === "string" ? entry.name.trim() : "";

      const match = ingredients.find((item) => {
        if (item.id === ingredient.id) {
          return false;
        }

        if (slug) {
          return item.slug === slug;
        }

        return name ? item.name.toLowerCase() === name.toLowerCase() : false;
      });

      if (!match && !name) {
        return null;
      }

      const key = match?.id || slug || name.toLowerCase();

      if (seen.has(key)) {
        return null;
      }

      seen.add(key);

      return {
        name: match?.name || name,
        slug: match?.slug || slug || undefined,
        scientificName: match?.scientific_name || null,
        category: match?.ingredient_category || null,
        image: match?.image_url || match?.featured_image || null,
        description:
          match?.short_description ||
          match?.seo_description ||
          (typeof entry.description === "string" ? entry.description : null),
      };
    })
    .filter(Boolean) as RelatedIngredientCardData[];
}

function resolveRelatedArticles(
  ingredient: Ingredient,
  blogs: Awaited<ReturnType<BlogService["getAllBlogs"]>>,
  categoryMap: ReturnType<typeof createCategoryMap>,
) {
  const searchTerms = [
    ingredient.name,
    ingredient.scientific_name ?? "",
    ingredient.ingredient_category ?? "",
  ]
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
        blog.content && typeof blog.content === "object" && !Array.isArray(blog.content) && "body" in blog.content && typeof blog.content.body === "string"
          ? blog.content.body
          : "",
        blog.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return searchTerms.some((term) => haystack.includes(term));
    })
    .slice(0, 3)
    .map((blog) => blogToCard(blog, categoryMap));
}

export async function generateMetadata({ params }: IngredientPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ingredientService = new IngredientService();
  const ingredient = await ingredientService.getPublishedIngredientBySlug(slug).catch(() => null);

  if (!ingredient) {
    return buildSeoMetadata(PageType.Ingredient, slug, {
      title: "Ingredient Not Found | Suppriva",
      description: "The requested ingredient profile could not be found.",
      canonicalPath: `/ingredient/${slug}`,
    });
  }

  return buildSeoMetadata(PageType.Ingredient, slug, {
    title: `${ingredient.seo_title || ingredient.name} | Suppriva Ingredients`,
    description:
      ingredient.seo_description ||
      ingredient.short_description ||
      ingredient.full_description ||
      `Research ${ingredient.name}, benefits, dosage, safety notes, and related products.`,
    canonicalPath: `/ingredient/${ingredient.slug}`,
    image: ingredient.image_url || ingredient.featured_image,
    type: "article",
  });
}

export default async function IngredientPage({ params }: IngredientPageProps) {
  const { slug } = await params;
  const ingredientService = new IngredientService();
  const ingredient = await ingredientService.getPublishedIngredientBySlug(slug).catch(() => null);

  if (!ingredient) {
    notFound();
  }

  const [categories, relatedProducts, blogs, allIngredients] = await Promise.all([
    new CategoryService().getAllCategories(),
    ingredientService.getRelatedProductsForIngredient(ingredient.id),
    new BlogService().getAllBlogs(),
    ingredientService.getPublishedIngredients(),
  ]);

  const publishedCategories = onlyPublished(categories);
  const categoryMap = createCategoryMap(publishedCategories);
  const productCards = relatedProducts.map((product, index) =>
    productToCategoryProduct(product, categoryMap, index),
  );
  const articleCards: BlogPostCard[] = resolveRelatedArticles(ingredient, blogs, categoryMap);
  const relatedIngredients = resolveRelatedIngredients(ingredient, allIngredients);
  const faqs = (Array.isArray(ingredient.faq_json) ? ingredient.faq_json : []).filter(
    (faq) => faq.question?.trim() && faq.answer?.trim(),
  );

  return (
    <>
      <JsonLdScript
        pageType={PageType.Ingredient}
        pageSlug={ingredient.slug}
        schema={[
          buildMedicalWebPageJsonLd(ingredient),
          buildIngredientDefinedTermJsonLd(ingredient, productCards),
          ...(faqs.length ? [buildFaqJsonLd(faqs)] : []),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ingredients", path: "/ingredients" },
            { name: ingredient.name, path: `/ingredient/${ingredient.slug}` },
          ]),
        ]}
      />
      <Navbar />
      <IngredientDetailTemplate
        ingredient={ingredient}
        relatedProducts={productCards}
        relatedIngredients={relatedIngredients}
        relatedArticles={articleCards}
      />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
