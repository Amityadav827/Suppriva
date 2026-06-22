import type { Metadata } from "next";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { IngredientsDirectoryClient } from "@/components/ingredients/IngredientsDirectoryClient";
import { Navbar } from "@/components/navbar/Navbar";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { CategoryProduct } from "@/lib/category-data";
import { PageType } from "@/lib/database/constants";
import type { FAQItem, Ingredient } from "@/lib/database/types";
import {
  blogToCard,
  createCategoryMap,
  onlyPublished,
  productToCategoryProduct,
} from "@/lib/live-data";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo/structured-data";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { ProductService } from "@/services/product.service";

export const dynamic = "force-dynamic";

function categoryLabel(value?: string | null) {
  return value?.trim() || "General Wellness";
}

function buildPopularIngredients(ingredients: Ingredient[]) {
  return [...ingredients]
    .sort((a, b) => {
      const ratingDifference = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDifference !== 0) {
        return ratingDifference;
      }

      if (a.is_featured !== b.is_featured) {
        return Number(b.is_featured) - Number(a.is_featured);
      }

      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 6);
}

function buildDirectoryFaqs(ingredients: Ingredient[]): FAQItem[] {
  const categories = Array.from(
    new Set(ingredients.map((ingredient) => categoryLabel(ingredient.ingredient_category))),
  );
  const categoryPreview = categories.slice(0, 4).join(", ");

  return [
    {
      question: "What is the Suppriva ingredients directory?",
      answer: `It is a live ingredient research library built from the Suppriva database and currently includes ${ingredients.length} ingredient profiles across categories such as ${categoryPreview}.`,
    },
    {
      question: "How can I search the ingredient library?",
      answer:
        "Use the directory search to filter by ingredient name, scientific name, or ingredient category. The A-Z directory and category groups update instantly from the visible search results.",
    },
    {
      question: "What kind of information appears on each ingredient page?",
      answer:
        "Ingredient profiles can include scientific names, overview content, how-it-works explanations, benefits, safety notes, FAQs, related ingredients, linked products, and related editorial content.",
    },
    {
      question: "Are these ingredient pages connected to products and blogs?",
      answer:
        "Yes. The directory is designed to support internal linking between ingredients, live product pages, and Suppriva blog articles so visitors can move deeper into supplement research.",
    },
  ];
}

function buildSeoParagraphs(ingredients: Ingredient[]) {
  const categories = Array.from(
    new Set(ingredients.map((ingredient) => categoryLabel(ingredient.ingredient_category))),
  );
  const topCategories = categories.slice(0, 5).join(", ");
  const featuredCount = ingredients.filter((ingredient) => ingredient.is_featured).length;
  const scientificCount = ingredients.filter((ingredient) => ingredient.scientific_name).length;

  return [
    `Suppriva's ingredients directory currently organizes ${ingredients.length} live ingredient profiles into ${categories.length} searchable categories, including ${topCategories}. The page is designed to help readers compare ingredients at a glance before diving into full profile pages.`,
    `Many records include scientific naming, short-form summaries, dosage context, benefit groupings, safety details, and relationship data that connects ingredients to product pages and editorial content. ${scientificCount} visible records already include scientific names, helping the directory feel closer to a structured medical-style reference library than a simple index.`,
    `Featured coverage currently highlights ${featuredCount} ingredient profiles, while the rest of the directory remains fully searchable through the A-Z index and category navigation. This gives Suppriva a stronger internal-linking surface for products, blogs, and ingredient research without hardcoding static content.`,
  ];
}

async function getIngredientsDirectoryData() {
  const ingredientService = new IngredientService();
  const [ingredients, featuredIngredients, products, blogs, categories] = await Promise.all([
    ingredientService.getPublishedIngredients(),
    ingredientService.getFeaturedIngredients(),
    new ProductService().getAllProducts(),
    new BlogService().getAllBlogs(),
    new CategoryService().getAllCategories(),
  ]);

  const publishedCategories = onlyPublished(categories);
  const categoryMap = createCategoryMap(publishedCategories);
  const publishedProducts = onlyPublished(products);
  const publishedBlogs = onlyPublished(blogs);

  const productLinks: CategoryProduct[] = publishedProducts
    .slice()
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4)
    .map((product, index) => productToCategoryProduct(product, categoryMap, index));

  const articleLinks: BlogPostCard[] = publishedBlogs
    .slice()
    .sort(
      (a, b) =>
        new Date(b.published_at ?? b.updated_at).getTime() -
        new Date(a.published_at ?? a.updated_at).getTime(),
    )
    .slice(0, 4)
    .map((blog) => blogToCard(blog, categoryMap));

  return {
    ingredients,
    featuredIngredients,
    popularIngredients: buildPopularIngredients(ingredients),
    productLinks,
    articleLinks,
    directoryFaqs: buildDirectoryFaqs(ingredients),
    seoParagraphs: buildSeoParagraphs(ingredients),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { ingredients, featuredIngredients } = await getIngredientsDirectoryData();
  const categories = Array.from(
    new Set(ingredients.map((ingredient) => categoryLabel(ingredient.ingredient_category))),
  );
  const title = `Ingredients Directory | ${ingredients.length} Live Ingredient Profiles | Suppriva`;
  const description = `Browse ${ingredients.length} Suppriva ingredient profiles across ${categories.length} categories including ${categories.slice(0, 4).join(", ")}. Compare scientific names, benefits, safety notes, and linked products from one premium directory.`;
  const heroImage =
    featuredIngredients.find((ingredient) => ingredient.image_url || ingredient.featured_image)
      ?.image_url ||
    featuredIngredients.find((ingredient) => ingredient.image_url || ingredient.featured_image)
      ?.featured_image;

  return buildSeoMetadata(PageType.Static, "ingredients", {
    title,
    description,
    canonicalPath: "/ingredients",
    image: heroImage,
  });
}

export default async function IngredientsPage() {
  const {
    ingredients,
    featuredIngredients,
    popularIngredients,
    productLinks,
    articleLinks,
    directoryFaqs,
    seoParagraphs,
  } = await getIngredientsDirectoryData();

  const description = `Browse ${ingredients.length} live ingredient profiles, compare supplement research, and move into related products and editorial content from one searchable directory.`;

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug="ingredients"
        schema={[
          buildCollectionPageJsonLd({
            title: "Suppriva Ingredients Directory",
            description,
            path: "/ingredients",
            items: ingredients.map((ingredient) => ({
              name: ingredient.name,
              path: `/ingredient/${ingredient.slug}`,
            })),
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ingredients", path: "/ingredients" },
          ]),
          buildFaqJsonLd(directoryFaqs),
        ]}
      />
      <Navbar />
      <IngredientsDirectoryClient
        ingredients={ingredients}
        featuredIngredients={featuredIngredients}
        popularIngredients={popularIngredients}
        products={productLinks}
        articles={articleLinks}
        directoryFaqs={directoryFaqs}
        seoParagraphs={seoParagraphs}
      />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
