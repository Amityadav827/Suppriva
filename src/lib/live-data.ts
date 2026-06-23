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
import type { ProductDetail } from "@/lib/product-data";
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
  ProductIngredient,
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

function benefitsFromProduct(product: Product): ProductDetail["benefits"] {
  const values = Array.isArray(product.benefits) ? product.benefits : [];
  const benefits = values
    .map((value, index) => {
      if (typeof value === "string") {
        return {
          title: value,
          description: "Supports a clean, consistent daily wellness routine.",
        };
      }

      const record = asRecord(value);

      if (!record) {
        return null;
      }

      return {
        title: textFromValue(record.title, `Benefit ${index + 1}`),
        description: textFromValue(
          record.description ?? record.benefit,
          "Supports a premium wellness routine when used as directed.",
        ),
      };
    })
    .filter(Boolean) as ProductDetail["benefits"];

  return benefits.length
    ? benefits
    : [
        {
          title: "Daily wellness support",
          description: "Designed to support consistent supplement habits.",
        },
        {
          title: "Premium ingredient focus",
          description: "Built around a clear supplement positioning and ingredient profile.",
        },
        {
          title: "Routine friendly",
          description: "Easy to compare and add to a health-focused daily plan.",
        },
        {
          title: "Goal-focused formula",
          description: "Created for shoppers researching targeted wellness support.",
        },
      ];
}

function ingredientsFromProduct(
  product: Product,
  linkedIngredients: Ingredient[] = [],
): ProductDetail["ingredients"] {
  if (linkedIngredients.length) {
    return linkedIngredients.map((ingredient) => ({
      name: ingredient.name,
      benefit:
        ingredient.short_description ||
        ingredient.full_description ||
        "Explore this ingredient in the Suppriva ingredient library.",
      slug: ingredient.slug,
      purpose:
        ingredient.best_for ||
        ingredient.ingredient_category ||
        ingredient.ingredient_form ||
        "Supplement support",
      description:
        ingredient.overview_content ||
        ingredient.short_description ||
        ingredient.full_description ||
        "Explore this ingredient in the Suppriva ingredient library.",
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
        "Included as part of the product's premium wellness formula.",
      purpose: ingredient.amount || "Formula support",
      description:
        ingredient.description ||
        "Included as part of the product's premium wellness formula.",
    }))
    .filter((ingredient) => ingredient.name);

  return ingredients.length
    ? ingredients
    : [
        {
          name: "Premium Formula Blend",
          benefit: "Review the official label for complete ingredient details and serving guidance.",
          purpose: "Label transparency",
          description: "Review the official label for complete ingredient details and serving guidance.",
        },
      ];
}

function buildStandoutPoints(
  product: Product,
  benefits: ProductDetail["benefits"],
  ingredients: ProductDetail["ingredients"],
) {
  return uniqueStrings([
    ...(product.pros ?? []),
    ...benefits.slice(0, 2).map((benefit) => benefit.title),
    ...ingredients.slice(0, 2).map((ingredient) => `${ingredient.name} included in the formula`),
    product.short_description ? splitSentences(product.short_description)[0] : null,
  ]).slice(0, 5);
}

function buildHowItWorks(product: Product, ingredients: ProductDetail["ingredients"]) {
  const fullDescriptionParagraphs = splitParagraphs(product.full_description);

  if (fullDescriptionParagraphs.length) {
    return fullDescriptionParagraphs.slice(0, 3);
  }

  const shortDescriptionSentences = splitSentences(product.short_description);
  if (shortDescriptionSentences.length) {
    return shortDescriptionSentences.slice(0, 3);
  }

  if (ingredients.length) {
    return ingredients
      .slice(0, 3)
      .map(
        (ingredient) =>
          `${ingredient.name} supports the formula through ${ingredient.purpose?.toLowerCase() || "its targeted role"} and ${ingredient.benefit.toLowerCase()}.`,
      );
  }

  return [
    "This formula is positioned as a targeted daily supplement for shoppers researching focused wellness support.",
  ];
}

function buildAudience(
  product: Product,
  categoryLabel: string,
  benefits: ProductDetail["benefits"],
  ingredients: ProductDetail["ingredients"],
) {
  return uniqueStrings([
    `${categoryLabel} support seekers`,
    ...benefits.slice(0, 3).map((benefit) => benefit.title),
    ...ingredients.slice(0, 2).map((ingredient) => ingredient.purpose || ingredient.name),
    product.short_description ? splitSentences(product.short_description)[0] : null,
  ])
    .map((item) => item.replace(/\.$/, ""))
    .slice(0, 4);
}

function buildSafety(
  product: Product,
  ingredients: ProductDetail["ingredients"],
): ProductDetail["safety"] {
  return {
    sideEffects: uniqueStrings([
      product.cons?.[0],
      product.cons?.[1],
      "Tolerance can vary by individual, especially with concentrated supplement blends.",
    ]).slice(0, 4),
    whoShouldAvoid: uniqueStrings([
      "People with known sensitivities to any listed ingredient.",
      "Anyone who has been advised to avoid new supplements without professional guidance.",
    ]).slice(0, 3),
    drugInteractions: uniqueStrings([
      ingredients[0]?.name
        ? `Review the official label and discuss ${ingredients[0].name} with your healthcare provider if you take prescription medication.`
        : "Consult your healthcare provider if you take prescription medication.",
      "Use extra caution if you already follow a supplement-heavy routine.",
    ]).slice(0, 3),
    precautions: uniqueStrings([
      "Follow the serving directions on the official label.",
      "Keep supplements out of reach of children and store them as directed.",
      "Use supplements as part of a balanced diet and health routine.",
    ]),
  };
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
  const ratingValue = Number((product.rating ?? 4.8).toFixed(1));
  const reviewCount = Math.max(24, ingredients.length * 9 + benefits.length * 13);
  const relatedProducts = related
    .map((slug) => products.find((item) => item.slug === slug))
    .filter(Boolean)
    .map((item, index) => productToCard(item as Product, categories, index));
  const standoutPoints = buildStandoutPoints(product, benefits, ingredients);
  const whoItsBestFor = buildAudience(product, categoryLabel, benefits, ingredients);
  const bestFor = whoItsBestFor[0] || `${categoryLabel} support`;
  const safety = buildSafety(product, ingredients);
  const name = product.title || product.name;

  return {
    slug: product.slug,
    path: buildProductPath(product.slug, category?.slug),
    productId: product.id,
    affiliateUrl: product.affiliate_url ?? undefined,
    name,
    category: categoryLabel,
    categorySlug: category?.slug,
    rating: ratingValue.toFixed(1),
    ratingValue,
    reviewCount,
    subtitle:
      product.short_description ||
      splitSentences(product.full_description)[0] ||
      `${name} is positioned for focused ${categoryLabel.toLowerCase()} support.`,
    description:
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
    standoutPoints,
    howItWorks: buildHowItWorks(product, ingredients),
    whoItsBestFor,
    bestFor,
    benefits,
    ingredients,
    safety,
    pros: product.pros?.length
      ? product.pros
      : ["Clear wellness positioning", "Premium supplement profile", "Easy routine fit"],
    cons: product.cons?.length
      ? product.cons
      : ["Results vary by lifestyle", "Review label before use", "Not a replacement for medical care"],
    faqs: product.faq?.length
      ? product.faq
      : [
          {
            question: `How do I use ${product.title || product.name}?`,
            answer: "Follow the official product directions and review the label before use.",
          },
          {
            question: "Is this supplement right for everyone?",
            answer:
              "Suitability depends on health status, medications, and personal goals. Consult a qualified professional when unsure.",
          },
        ],
    verdict: {
      summary:
        product.short_description ||
        `${name} is a focused ${categoryLabel.toLowerCase()} supplement that stands out for its ingredient profile and research-friendly positioning.`,
      bestFor,
      notIdealFor:
        product.cons?.[0] ||
        "Shoppers looking for medical treatment rather than a supplement research option.",
      recommendation:
        `${name} is best researched through its ingredient list, benefit profile, and official label before purchase.`,
    },
    buyingGuidance: [
      "Use the official website for the most current pricing, offers, and label details.",
      "Review serving guidance, ingredient transparency, and refund information before checkout.",
      "Affiliate links help support Suppriva research at no extra cost to the reader.",
    ],
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
