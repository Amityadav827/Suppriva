import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { IngredientDetailTemplate } from "@/components/ingredients/IngredientDetailTemplate";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildIngredientJsonLd,
} from "@/lib/seo/structured-data";
import { blogToCard, createCategoryMap, onlyPublished, productToCategoryProduct } from "@/lib/live-data";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";

type IngredientPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: IngredientPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ingredientService = new IngredientService();
  const ingredient = await ingredientService.getIngredientBySlug(slug).catch(() => null);

  if (!ingredient) {
    return buildSeoMetadata(PageType.Ingredient, slug, {
      title: "Ingredient Not Found | Suppriva",
      description: "The requested ingredient profile could not be found.",
      canonicalPath: `/ingredient/${slug}`,
    });
  }

  return buildSeoMetadata(PageType.Ingredient, slug, {
    title: `${ingredient.meta_title || ingredient.name} | Suppriva Ingredients`,
    description:
      ingredient.meta_description ||
      ingredient.short_description ||
      `Research ${ingredient.name}, benefits, dosage, side effects, and related products.`,
    canonicalPath: `/ingredient/${ingredient.slug}`,
    image: ingredient.featured_image,
    type: "article",
  });
}

export default async function IngredientPage({ params }: IngredientPageProps) {
  const { slug } = await params;
  const ingredientService = new IngredientService();
  const ingredient = await ingredientService.getIngredientBySlug(slug).catch(() => null);

  if (!ingredient) {
    notFound();
  }

  const [categories, relatedProducts, blogs] = await Promise.all([
    new CategoryService().getAllCategories(),
    ingredientService.getRelatedProductsForIngredient(ingredient.id),
    new BlogService().getAllBlogs(),
  ]);
  const categoryMap = createCategoryMap(onlyPublished(categories));
  const productCards = relatedProducts.map((product, index) =>
    productToCategoryProduct(product, categoryMap, index),
  );
  const articleCards = onlyPublished(blogs)
    .filter((blog) =>
      [blog.title, blog.excerpt ?? "", blog.seo_description ?? "", blog.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(ingredient.name.toLowerCase()),
    )
    .slice(0, 3)
    .map((blog) => blogToCard(blog, categoryMap));
  const faqs = [
    {
      question: `What is ${ingredient.name}?`,
      answer:
        ingredient.short_description ||
        `${ingredient.name} is listed in the Suppriva ingredient library for supplement research.`,
    },
    {
      question: `What are common benefits of ${ingredient.name}?`,
      answer: ingredient.benefits.length
        ? ingredient.benefits.slice(0, 3).join(" ")
        : "Benefits depend on product context, dose, and individual health factors.",
    },
    {
      question: `Are there side effects of ${ingredient.name}?`,
      answer: ingredient.side_effects.length
        ? ingredient.side_effects.slice(0, 3).join(" ")
        : "Review product labels and consult a qualified professional when unsure.",
    },
  ];

  return (
    <>
      <JsonLdScript
        pageType={PageType.Ingredient}
        pageSlug={ingredient.slug}
        schema={[
          buildIngredientJsonLd(ingredient),
          buildFaqJsonLd(faqs),
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
        relatedArticles={articleCards}
      />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
