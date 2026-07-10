import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { IngredientDetailTemplate, type RelatedIngredientCardData } from "@/components/ingredients/IngredientDetailTemplate";
import { Navbar } from "@/components/navbar/Navbar";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { PageType } from "@/lib/database/constants";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import { resolveExpertAttribution } from "@/lib/eeat/server";
import type { Ingredient, JsonValue } from "@/lib/database/types";
import { blogToCard, createCategoryMap, onlyPublished, productToCategoryProduct } from "@/lib/live-data";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildIngredientDefinedTermJsonLd,
  buildMedicalWebPageJsonLd,
  buildPersonJsonLd,
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

function uniqueBy<T>(items: T[], getKey: (item: T) => string | null | undefined) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item)?.trim().toLowerCase();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function resolveRelatedIngredients(
  ingredient: Ingredient,
  ingredients: Ingredient[],
): RelatedIngredientCardData[] {
  const seen = new Set<string>();
  const publishedIngredients = onlyPublished(ingredients).filter(
    (item) => item.id !== ingredient.id && item.slug !== ingredient.slug,
  );
  const relatedEntries = Array.isArray(ingredient.related_ingredients_json)
    ? ingredient.related_ingredients_json
    : [];

  const manualMatches = relatedEntries
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const slug = typeof entry.slug === "string" ? entry.slug.trim() : "";
      const name = typeof entry.name === "string" ? entry.name.trim() : "";

      const match = publishedIngredients.find((item) => {
        if (slug) {
          return item.slug === slug;
        }

        return name ? item.name.toLowerCase() === name.toLowerCase() : false;
      });

      if (!match) {
        return null;
      }

      const key = match.id;

      if (seen.has(key)) {
        return null;
      }

      seen.add(key);

      return {
        name: match.name,
        slug: match.slug,
        scientificName: match.scientific_name || null,
        category: match.ingredient_category || null,
        image: match.image_url || match.featured_image || null,
        description:
          match.short_description ||
          match.seo_description ||
          (typeof entry.description === "string" ? entry.description : null),
      };
    })
    .filter(Boolean) as RelatedIngredientCardData[];

  const automaticMatches = publishedIngredients
    .filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }

      return item.ingredient_category === ingredient.ingredient_category;
    })
    .slice(0, Math.max(0, 6 - manualMatches.length))
    .map((item) => {
      seen.add(item.id);

      return ingredientToRelatedCard(item);
    });

  return [...manualMatches, ...automaticMatches].slice(0, 6);
}

function ingredientToRelatedCard(ingredient: Ingredient): RelatedIngredientCardData {
  return {
    name: ingredient.name,
    slug: ingredient.slug,
    scientificName: ingredient.scientific_name || null,
    category: ingredient.ingredient_category || null,
    image: ingredient.image_url || ingredient.featured_image || null,
    description: ingredient.short_description || ingredient.seo_description || null,
  };
}

function resolveCompareAlternatives(
  ingredient: Ingredient,
  ingredients: Ingredient[],
): RelatedIngredientCardData[] {
  const terms = [
    ingredient.ingredient_category,
    ingredient.best_for,
    ingredient.safety_level,
    ingredient.taste_profile,
  ]
    .map((term) => term?.trim().toLowerCase())
    .filter(Boolean) as string[];

  return uniqueBy(
    onlyPublished(ingredients).filter(
      (item) => item.id !== ingredient.id && item.slug !== ingredient.slug,
    ),
    (item) => item.slug || item.id,
  )
    .map((item) => {
      const haystack = [
        item.ingredient_category,
        item.best_for,
        item.safety_level,
        item.taste_profile,
        item.short_description,
        item.seo_description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const score =
        (item.ingredient_category === ingredient.ingredient_category ? 4 : 0) +
        terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, 6)
    .map(({ item }) => ingredientToRelatedCard(item));
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

  const publishedBlogs = onlyPublished(blogs);
  const matchedBlogs = uniqueBy(publishedBlogs, (blog) => blog.slug || blog.id)
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
        Array.isArray(blog.tags) ? blog.tags.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchTerms.some((term) => haystack.includes(term));
    })
    .slice(0, 3);

  if (matchedBlogs.length) {
    return matchedBlogs.map((blog) => blogToCard(blog, categoryMap));
  }

  const sameCategoryBlogs = ingredient.ingredient_category
    ? publishedBlogs.filter((blog) => {
        const categoryTitle = blog.category_id
          ? categoryMap.get(blog.category_id)?.title ?? ""
          : "";

        return categoryTitle.toLowerCase() === ingredient.ingredient_category?.toLowerCase();
      })
    : [];

  return uniqueBy(sameCategoryBlogs.length ? sameCategoryBlogs : publishedBlogs, (blog) => blog.slug || blog.id)
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
    canonicalPath: ingredient.seo_canonical_url || `/ingredient/${ingredient.slug}`,
    image:
      ingredient.seo_og_image ||
      ingredient.seo_twitter_image ||
      ingredient.meta_image ||
      ingredient.image_url ||
      ingredient.featured_image,
    openGraphTitle: ingredient.seo_og_title,
    openGraphDescription: ingredient.seo_og_description,
    openGraphImage: ingredient.seo_og_image || ingredient.meta_image,
    twitterTitle: ingredient.seo_twitter_title,
    twitterDescription: ingredient.seo_twitter_description,
    twitterImage: ingredient.seo_twitter_image || ingredient.seo_og_image || ingredient.meta_image,
    noindex: ingredient.seo_noindex,
    nofollow: ingredient.seo_nofollow,
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
  const productCards = uniqueBy(relatedProducts, (product) => product.slug || product.id).map(
    (product, index) => productToCategoryProduct(product, categoryMap, index),
  );
  const articleCards: BlogPostCard[] = resolveRelatedArticles(ingredient, blogs, categoryMap);
  const relatedIngredients = resolveRelatedIngredients(ingredient, allIngredients);
  const compareAlternatives = resolveCompareAlternatives(ingredient, allIngredients);
  const healthNeeds = uniqueBy(publishedCategories, (category) => category.slug).map(
    (category) => ({
      label: category.title || category.name,
      slug: category.slug,
    }),
  );
  const expertAttribution = await resolveExpertAttribution({
    authorId: ingredient.author_id,
    reviewerId: ingredient.reviewer_id,
    updatedAt: ingredient.updated_at || ingredient.created_at,
  });
  const faqs = (Array.isArray(ingredient.faq_json) ? ingredient.faq_json : []).filter(
    (faq) => faq.question?.trim() && faq.answer?.trim(),
  );

  return (
    <>
      <JsonLdScript
        pageType={PageType.Ingredient}
        pageSlug={ingredient.slug}
        schema={[
          buildMedicalWebPageJsonLd(ingredient, expertAttribution),
          buildIngredientDefinedTermJsonLd(ingredient, productCards, expertAttribution),
          buildPersonJsonLd(expertAttribution.author, "author"),
          buildPersonJsonLd(expertAttribution.reviewer, "reviewer"),
          ...(ingredient.schema_json &&
          typeof ingredient.schema_json === "object" &&
          !Array.isArray(ingredient.schema_json) &&
          Object.keys(ingredient.schema_json).length
            ? [ingredient.schema_json]
            : []),
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
        expertAttribution={expertAttribution}
        relatedProducts={productCards}
        relatedIngredients={relatedIngredients}
        relatedArticles={articleCards}
        compareAlternatives={compareAlternatives}
        healthNeeds={healthNeeds}
      />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
