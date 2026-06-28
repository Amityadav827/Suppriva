import {
  Activity,
  Bone,
  Brain,
  BrainCircuit,
  Compass,
  Dumbbell,
  Ear,
  Eye,
  Flower2,
  Hand,
  HeartHandshake,
  HeartPulse,
  Leaf,
  Moon,
  Pill,
  Scale,
  Scissors,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Wind,
} from "lucide-react";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { ProductCardData } from "@/components/product/ProductCard";
import type { ShowcaseProductData } from "@/components/product/SupplementShowcaseCard";
import type { SearchResult } from "@/lib/search-data";
import type { CategoryDetail, CategoryProduct } from "@/lib/category-data";
import type { ProductDetail, ProductDetailCmsCard } from "@/lib/product-data";
import { ContentStatus } from "@/lib/database/constants";
import { buildProductPath } from "@/lib/products/url";
import type {
  Blog,
  Category,
  ExpertAttribution,
  FAQItem,
  Ingredient,
  JsonValue,
  Product,
  ProductCmsCard,
  ProductHowItWorksStep,
  ProductIngredient,
  ProductIngredientOverride,
  ProductSafetyItem,
} from "@/lib/database/types";

const accentPairs = [
  { accent: "from-soft-green to-gold/[0.14]", glow: "bg-primary/[0.12]" },
  { accent: "from-primary/[0.12] to-soft-green", glow: "bg-gold/[0.16]" },
  { accent: "from-gold/[0.16] to-white", glow: "bg-primary/[0.10]" },
  { accent: "from-primary/[0.14] to-gold/[0.16]", glow: "bg-gold/[0.14]" },
];

const categoryIconMap = [
  { matches: ["immunity", "immune"], icon: ShieldCheck },
  { matches: ["blood sugar", "diabetes"], icon: Activity },
  { matches: ["bone", "joint"], icon: Bone },
  { matches: ["brain", "memory"], icon: Brain },
  { matches: ["sleep", "relaxation"], icon: Moon },
  { matches: ["heart"], icon: HeartPulse },
  { matches: ["gut"], icon: Leaf },
  { matches: ["skin"], icon: Sparkles },
  { matches: ["sexual"], icon: HeartHandshake },
  { matches: ["energy", "athletic", "performance"], icon: Dumbbell },
  { matches: ["prostate"], icon: Shield },
  { matches: ["lung"], icon: Wind },
  { matches: ["nervous"], icon: BrainCircuit },
  { matches: ["vision"], icon: Eye },
  { matches: ["hearing"], icon: Ear },
  { matches: ["teeth", "gums"], icon: Smile },
  { matches: ["nail"], icon: Hand },
  { matches: ["general wellness", "wellness"], icon: Compass },
  { matches: ["women"], icon: Flower2 },
  { matches: ["men"], icon: Dumbbell },
  { matches: ["hair"], icon: Scissors },
  { matches: ["weight"], icon: Scale },
];

export function getCategoryIcon(label: string) {
  const normalized = label.toLowerCase();
  return (
    categoryIconMap.find((item) =>
      item.matches.some((match) => normalized.includes(match)),
    )?.icon ?? Pill
  );
}

export function onlyPublished<T extends { status?: ContentStatus; deleted_at?: string | null }>(
  records: T[],
) {
  return records.filter(
    (record) => record.status === ContentStatus.Published && record.deleted_at === null,
  );
}

export function categoryTitle(category?: Category | null) {
  return category?.title || category?.name || "Wellness";
}

export function createCategoryMap(categories: Category[]) {
  return new Map(categories.map((category) => [category.id, category]));
}

export function productToCard(
  product: Product,
  categories: Map<string, Category>,
  index = 0,
): ProductCardData {
  const accent = accentPairs[index % accentPairs.length];
  const category = product.category_id ? categories.get(product.category_id) : null;

  return {
    slug: product.slug,
    href: buildProductPath(product.slug, category?.slug),
    name: product.title || product.name,
    subtitle:
      product.short_description ||
      product.full_description ||
      "Premium supplement pick with clean daily wellness positioning.",
    category: categoryTitle(category),
    rating: (product.rating ?? 4.8).toFixed(1),
    image: product.image || product.gallery?.[0],
    glow: accent.glow,
    accent: accent.accent,
  };
}

export function productToShowcaseCard(
  product: Product,
  categories: Map<string, Category>,
  index = 0,
): ShowcaseProductData {
  const accent = accentPairs[index % accentPairs.length];
  const category = product.category_id ? categories.get(product.category_id) : null;
  const badgeCycle: ShowcaseProductData["status"][] = [
    "FEATURED",
    "POPULAR",
    "TRENDING",
    "UPDATED",
  ];

  return {
    slug: product.slug,
    href: buildProductPath(product.slug, category?.slug),
    name: product.title || product.name,
    benefit:
      product.short_description ||
      product.full_description ||
      "Ingredient-focused wellness support designed for confident supplement discovery.",
    category: categoryTitle(category),
    status: badgeCycle[index % badgeCycle.length],
    image: product.image || product.gallery?.[0],
    accent: accent.accent,
    imageScale: index % 2 === 0 ? "scale-[1.08]" : "scale-[1.02]",
  };
}

export function productToCategoryProduct(
  product: Product,
  categories: Map<string, Category>,
  index = 0,
): CategoryProduct {
  const accent = accentPairs[index % accentPairs.length];
  const category = product.category_id ? categories.get(product.category_id) : null;

  return {
    slug: product.slug,
    href: buildProductPath(product.slug, category?.slug),
    name: product.title || product.name,
    category: categoryTitle(category),
    rating: (product.rating ?? 4.8).toFixed(1),
    description:
      product.short_description ||
      product.full_description ||
      "Premium wellness formula positioned for clean supplement discovery.",
    image: product.image || product.gallery?.[0],
    accent: accent.accent,
    glow: accent.glow,
    featured: index < 6,
  };
}

function asRecord(value: JsonValue): Record<string, JsonValue> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, JsonValue>)
    : null;
}

function textFromValue(value: JsonValue | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function splitParagraphs(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitSentences(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function parseHeroChecklist(items: string[]): ProductDetail["heroChecklist"] {
  return items
    .map((item) => {
      const parts = item.split("|").map((part) => part.trim());

      if (parts.length >= 2) {
        return { icon: parts[0] || null, text: parts.slice(1).join(" | ") };
      }

      return { icon: null, text: item.trim() };
    })
    .filter((item) => item.text);
}

function cmsCardsToHeroHighlights(items?: ProductCmsCard[]): ProductDetail["heroHighlights"] {
  return (items ?? [])
    .filter((item) => item.is_active)
    .sort((first, second) => first.display_order - second.display_order)
    .map((item) => ({
      icon: item.icon,
      title: item.title,
      description: item.description,
    }))
    .filter((item) => item.title.trim());
}

function cmsCardsToDetailCards(items?: ProductCmsCard[]): ProductDetailCmsCard[] {
  return (items ?? [])
    .filter((item) => item.is_active && item.title.trim())
    .sort((first, second) => first.display_order - second.display_order)
    .map((item) => ({
      icon: item.icon,
      title: item.title,
      description: item.description,
    }));
}

function howItWorksStepsToCards(items?: ProductHowItWorksStep[]): ProductDetailCmsCard[] {
  return (items ?? [])
    .filter((item) => item.is_active && (item.title?.trim() || item.description?.trim()))
    .sort((first, second) => first.display_order - second.display_order)
    .map((item, index) => ({
      icon: item.icon,
      title: item.title?.trim() || `Step ${index + 1}`,
      description: item.description,
    }));
}

function safetyItemsToCards(items?: ProductSafetyItem[]): ProductDetailCmsCard[] {
  return (items ?? [])
    .filter((item) => item.is_active && item.title.trim())
    .sort((first, second) => first.display_order - second.display_order)
    .map((item) => ({
      icon: item.icon || item.item_type,
      title: item.title,
      description: item.description,
    }));
}

function benefitsFromProduct(product: Product): ProductDetail["benefits"] {
  const values = Array.isArray(product.benefits) ? product.benefits : [];
  return values
    .map((value, index) => {
      if (typeof value === "string") {
        return {
          title: value,
          description: "",
        };
      }

      const record = asRecord(value);

      if (!record) {
        return null;
      }

      return {
        title: textFromValue(record.title, `Benefit ${index + 1}`),
        description: textFromValue(record.description ?? record.benefit, ""),
        icon: textFromValue(record.icon, "") || null,
      };
    })
    .filter(Boolean) as ProductDetail["benefits"];
}

function createIngredientOverrideMap(overrides?: ProductIngredientOverride[]) {
  return new Map((overrides ?? []).map((override) => [override.ingredient_id, override]));
}

function ingredientsFromProduct(
  product: Product,
  linkedIngredients: Ingredient[] = [],
): ProductDetail["ingredients"] {
  if (linkedIngredients.length) {
    const overrides = createIngredientOverrideMap(product.ingredient_overrides);

    return linkedIngredients
      .map((ingredient, index) => ({
        ingredient,
        override: overrides.get(ingredient.id),
        index,
      }))
      .sort(
        (first, second) =>
          (first.override?.display_order ?? first.index) -
          (second.override?.display_order ?? second.index),
      )
      .map(({ ingredient, override }) => ({
        id: ingredient.id,
        name: ingredient.name,
        benefit:
          override?.description_override ||
          ingredient.short_description ||
          ingredient.full_description ||
          "",
        slug: ingredient.slug,
        purpose:
          override?.purpose ||
          ingredient.best_for ||
          ingredient.ingredient_category ||
          ingredient.ingredient_form ||
          "",
        dosage: override?.dosage ?? null,
        customNote: override?.custom_note ?? null,
        isHighlighted: override?.is_highlighted ?? false,
        description:
          override?.description_override ||
          ingredient.overview_content ||
          ingredient.short_description ||
          ingredient.full_description ||
          "",
        image: ingredient.image_url || ingredient.featured_image || undefined,
        category: ingredient.ingredient_category || undefined,
        scientificName: ingredient.scientific_name,
      }));
  }

  const ingredients = (product.ingredients ?? [])
    .map((ingredient: ProductIngredient, index) => ({
      name: ingredient.name || `Ingredient ${index + 1}`,
      benefit:
        ingredient.description ||
        ingredient.amount ||
        "",
      purpose: ingredient.amount || "Formula support",
      description:
        ingredient.description ||
        "",
    }))
    .filter((ingredient) => ingredient.name);

  return ingredients;
}

function visibleFaqs(items?: FAQItem[]) {
  return (items ?? [])
    .filter((item) => item.is_visible !== false && item.question.trim() && item.answer.trim())
    .sort((first, second) => (first.display_order ?? 0) - (second.display_order ?? 0))
    .map((item) => ({
      question: item.question,
      answer: item.answer,
    }));
}

export function productToDetail(
  product: Product,
  products: Product[],
  categories: Map<string, Category>,
  expertAttribution: ExpertAttribution,
  linkedIngredients: Ingredient[] = [],
): ProductDetail {
  const benefits = benefitsFromProduct(product);
  const ingredients = ingredientsFromProduct(product, linkedIngredients);
  const category = product.category_id ? categories.get(product.category_id) : null;
  const categoryLabel = categoryTitle(category);
  const related = products
    .filter((item) => item.slug !== product.slug)
    .slice(0, 6)
    .map((item) => item.slug);
  const ratingValue = Number((product.rating ?? 0).toFixed(1));
  const reviewCount = product.review_count ?? 0;
  const relatedProducts = related
    .map((slug) => products.find((item) => item.slug === slug))
    .filter(Boolean)
    .map((item, index) => productToCard(item as Product, categories, index));
  const heroHighlights = cmsCardsToHeroHighlights(product.standout_points);
  const standoutPoints = cmsCardsToDetailCards(product.standout_points);
  const howItWorks = howItWorksStepsToCards(product.how_it_works_steps);
  const howItWorksIntro = splitParagraphs(product.how_it_works_content);
  const whoItsBestFor = cmsCardsToDetailCards(product.best_for_items);
  const safetyItems = safetyItemsToCards(product.safety_items);
  const buyingGuidance = cmsCardsToDetailCards(product.buying_guide_items);
  const bestFor = product.verdict_best_for || whoItsBestFor[0]?.title || "";
  const name = product.title || product.name;
  const overviewParagraphs = splitParagraphs(product.overview_content);
  const faqs = visibleFaqs(product.faq);

  return {
    slug: product.slug,
    path: buildProductPath(product.slug, category?.slug),
    productId: product.id,
    affiliateUrl: product.affiliate_url ?? undefined,
    name,
    heroTitle: product.hero_title || name,
    heroBadge: product.hero_badge,
    heroImageAlt: product.hero_image_alt,
    heroCtaLabel: product.hero_cta_label || "Visit Official Website",
    heroCtaTarget: product.hero_cta_target ?? "_blank",
    heroSecondaryCtaLabel: product.hero_secondary_cta_label || "Buy Now",
    heroSecondaryCtaTarget: product.hero_secondary_cta_target ?? "_blank",
    heroChecklist: parseHeroChecklist(product.hero_checklist),
    heroHighlights: heroHighlights.length
      ? heroHighlights
      : benefits.slice(0, 4).map((benefit) => ({
          icon: null,
          title: benefit.title,
          description: benefit.description,
        })),
    heroShowRating: product.hero_show_rating,
    heroShowBadge: product.hero_show_badge,
    category: categoryLabel,
    categorySlug: category?.slug,
    rating: ratingValue.toFixed(1),
    ratingValue,
    ratingScaleLabel: product.rating_label || "out of 5",
    reviewCount,
    subtitle:
      product.hero_subtitle ||
      product.short_description ||
      splitSentences(product.full_description)[0] ||
      `${name} is positioned for focused ${categoryLabel.toLowerCase()} support.`,
    description:
      product.hero_description ||
      product.short_description ||
      product.full_description ||
      "A premium supplement formula prepared for focused wellness research and product comparison.",
    image: product.image || product.gallery?.[0],
    gallery: [product.image, ...(product.gallery ?? [])].filter(Boolean) as string[],
    bullets: benefits.slice(0, 4).map((benefit) => benefit.title),
    trustBadges: uniqueStrings([
      `${ingredients.length} ingredient${ingredients.length === 1 ? "" : "s"} profiled`,
      `${benefits.length} benefit${benefits.length === 1 ? "" : "s"} highlighted`,
      `${categoryLabel} category match`,
      product.status === ContentStatus.Published ? "Published profile" : null,
    ]).slice(0, 4),
    whatIs: {
      title: product.overview_title || `What Is ${name}?`,
      subtitle: product.overview_subtitle || "",
      paragraphs: overviewParagraphs,
    },
    standoutTitle: "Why This Product Stands Out",
    standoutSubtitle: "",
    standoutPoints,
    howItWorksTitle: product.how_it_works_title || `How ${name} Works`,
    howItWorksSubtitle: product.how_it_works_subtitle || "",
    howItWorksIntro,
    howItWorks,
    benefitsTitle: product.benefits_title || "Key Benefits",
    benefitsSubtitle: product.benefits_subtitle || "",
    whoItsBestFor,
    whoItsBestForTitle: product.best_for_title || "Who Is It Best For?",
    whoItsBestForSubtitle: product.best_for_subtitle || "",
    bestFor,
    benefits,
    ingredientsTitle: product.ingredients_title || "Ingredient Breakdown",
    ingredientsSubtitle: product.ingredients_subtitle || "",
    ingredients,
    safetyTitle: product.safety_title || "Safety Information",
    safetySubtitle: product.safety_subtitle || "",
    safetyItems,
    safety: {
      sideEffects: [],
      whoShouldAvoid: [],
      drugInteractions: [],
      precautions: [],
    },
    pros: product.pros ?? [],
    cons: product.cons ?? [],
    prosConsTitle: product.pros_cons_title || "Pros & Cons",
    prosConsSubtitle: product.pros_cons_subtitle || "",
    faqTitle: product.faq_title || "Frequently Asked Questions",
    faqSubtitle: product.faq_subtitle || "",
    faqs,
    verdictTitle: product.verdict_title || "SuppRiva Verdict",
    verdictSubtitle: product.verdict_subtitle || "",
    verdict: {
      summary: product.verdict_summary || "",
      bestFor,
      notIdealFor: product.verdict_not_ideal_for || "",
      recommendation: product.verdict_recommendation || "",
      conclusion: product.verdict_conclusion,
    },
    buyingGuideTitle: product.buying_guide_title || `Where To Buy ${name}`,
    buyingGuideSubtitle: product.buying_guide_subtitle || "",
    buyingCtaLabel: product.buying_cta_label || "Visit Official Website",
    buyingGuidance,
    relatedIngredients: ingredients
      .filter((ingredient) => ingredient.slug)
      .slice(0, 6)
      .map((ingredient) => ({
        name: ingredient.name,
        slug: ingredient.slug,
        benefit: ingredient.benefit,
        image: ingredient.image,
        category: ingredient.category,
        scientificName: ingredient.scientificName,
      })),
    relatedArticles: [],
    healthNeeds: [],
    related,
    comparisonProducts: relatedProducts.slice(0, 4),
    relatedProducts,
    expertAttribution,
  };
}

export function blogToCard(blog: Blog, categories: Map<string, Category>): BlogPostCard {
  const category = blog.category_id ? categories.get(blog.category_id) : null;

  return {
    slug: blog.slug,
    title: blog.title,
    description:
      blog.excerpt ||
      blog.seo_description ||
      "Premium Suppriva wellness guide for supplement research and smarter decisions.",
    category: categoryTitle(category),
    categorySlug: category?.slug,
    readingTime: blog.reading_time || "7 min read",
    image: blog.featured_image || "/assets/blog-weight-loss.webp",
  };
}

export function categoryToDetail(
  category: Category,
  allCategories: Category[],
  products: Product[],
  blogs: Blog[],
): CategoryDetail {
  const categoryProducts = products.filter((product) => product.category_id === category.id);
  const categoryBlogs = blogs.filter((blog) => blog.category_id === category.id);
  const categories = createCategoryMap(allCategories);
  const productCards = categoryProducts.map((product, index) =>
    productToCategoryProduct(product, categories, index),
  );
  const title = category.title.endsWith("Supplements")
    ? category.title
    : `${category.title} Supplements`;
  const description =
    category.description ||
    category.seo_description ||
    `Discover premium ${category.title.toLowerCase()} supplements selected for clean wellness research.`;
  const relatedCategories = allCategories
    .filter((item) => item.id !== category.id)
    .slice(0, 6)
    .map((item) => ({ label: item.title, slug: item.slug }));

  return {
    slug: category.slug,
    title,
    eyebrow: category.title,
    subtitle: description,
    image: category.image ?? undefined,
    stats: [
      `${categoryProducts.length} Product${categoryProducts.length === 1 ? "" : "s"}`,
      `${categoryBlogs.length} Guide${categoryBlogs.length === 1 ? "" : "s"}`,
      "Updated Weekly",
      "Published Picks",
    ],
    products: productCards,
    featured: productCards.filter((product) => product.featured).slice(0, 6),
    relatedCategories,
    seoTitle: category.seo_title || `Best ${category.title} Supplements: Complete Guide`,
    seoParagraphs: [
      description,
      `Suppriva organizes ${category.title.toLowerCase()} products with live category data, product ratings, descriptions, and affiliate-ready research details from the database.`,
      category.seo_description ||
        "Always review the official product label and use supplements as part of a balanced wellness routine.",
    ],
    facts: [
      `${categoryProducts.length} live product records are connected to this category.`,
      category.seo_keywords?.length
        ? `SEO focus: ${category.seo_keywords.slice(0, 4).join(", ")}.`
        : "Category metadata is ready for SEO expansion.",
      "Published database records power this page.",
    ],
    faqs: buildCategoryFaq(category.title),
  };
}

function buildCategoryFaq(title: string): FAQItem[] {
  return [
    {
      question: `What are ${title.toLowerCase()} supplements?`,
      answer:
        "They are supplement products organized around this wellness goal and pulled from Suppriva's live database.",
    },
    {
      question: "How are products selected?",
      answer:
        "Products shown here come from published dashboard records with category assignment, descriptions, ratings, and affiliate data.",
    },
    {
      question: "Are supplements a replacement for medical care?",
      answer:
        "No. Supplements should not replace professional medical advice, diagnosis, or treatment.",
    },
    {
      question: "How often is this category updated?",
      answer:
        "The page updates from live Supabase records as dashboard content changes.",
    },
  ];
}

export function buildSearchResults(
  products: Product[],
  categories: Category[],
  blogs: Blog[],
  ingredients: Ingredient[] = [],
): SearchResult[] {
  const categoryMap = createCategoryMap(categories);

  return [
    ...products.map((product) => ({
      id: product.id,
      type: "product" as const,
      title: product.title || product.name,
      category: categoryTitle(product.category_id ? categoryMap.get(product.category_id) : null),
      rating: (product.rating ?? 4.8).toFixed(1),
      description:
        product.short_description ||
        product.full_description ||
        "Premium supplement record from Suppriva.",
      href: buildProductPath(
        product.slug,
        product.category_id ? categoryMap.get(product.category_id)?.slug : undefined,
      ),
      image: product.image || product.gallery?.[0] || "/assets/hero-supplements.webp",
    })),
    ...categories.map((category) => ({
      id: category.id,
      type: "category" as const,
      title: `${category.title} Supplements`,
      category: "Category",
      description: category.description || category.seo_description || "Suppriva supplement category.",
      href: `/category/${category.slug}`,
      image: category.image || undefined,
    })),
    ...blogs.map((blog) => ({
      id: blog.id,
      type: "article" as const,
      title: blog.title,
      category: categoryTitle(blog.category_id ? categoryMap.get(blog.category_id) : null),
      readingTime: blog.reading_time || "7 min read",
      description: blog.excerpt || blog.seo_description || "Suppriva wellness article.",
      href: `/blog/${blog.slug}`,
      image: blog.featured_image || "/assets/blog-weight-loss.webp",
    })),
    ...ingredients.map((ingredient) => ({
      id: ingredient.id,
      type: "ingredient" as const,
      title: ingredient.name,
      category: "Ingredient",
      readingTime: ingredient.is_featured ? "Featured" : "Library",
      description:
        ingredient.short_description ||
        ingredient.seo_description ||
        ingredient.meta_description ||
        "Suppriva ingredient library reference.",
      href: `/ingredient/${ingredient.slug}`,
      image: ingredient.image_url || ingredient.featured_image || "/assets/hero-supplements.webp",
    })),
  ];
}
