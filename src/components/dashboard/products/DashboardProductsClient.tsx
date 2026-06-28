"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import {
  MediaGalleryField,
  MediaLibraryField,
} from "@/components/dashboard/media/MediaLibraryField";
import { ContentStatus } from "@/lib/database/constants";
import type {
  Author,
  Blog,
  Category,
  FAQItem,
  Ingredient,
  JsonValue,
  Product,
  Reviewer,
} from "@/lib/database/types";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type ProductFormState = {
  title: string;
  slug: string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_image_alt: string;
  hero_cta_label: string;
  hero_cta_target: "_self" | "_blank";
  hero_secondary_cta_label: string;
  hero_secondary_cta_target: "_self" | "_blank";
  hero_checklist: string;
  hero_show_rating: boolean;
  hero_show_badge: boolean;
  review_count: string;
  rating_label: string;
  category_id: string;
  author_id: string;
  reviewer_id: string;
  ingredient_ids: string[];
  short_description: string;
  full_description: string;
  image: string;
  gallery: string[];
  rating: string;
  affiliate_url: string;
  benefits: string;
  pros: string;
  cons: string;
  faq: string;
  overview_title: string;
  overview_subtitle: string;
  overview_content: string;
  how_it_works_title: string;
  how_it_works_subtitle: string;
  how_it_works_content: string;
  how_it_works_steps: string;
  benefits_title: string;
  benefits_subtitle: string;
  ingredients_title: string;
  ingredients_subtitle: string;
  best_for_title: string;
  best_for_subtitle: string;
  best_for_items: string;
  standout_points: string;
  safety_title: string;
  safety_subtitle: string;
  safety_items: string;
  pros_cons_title: string;
  pros_cons_subtitle: string;
  faq_title: string;
  faq_subtitle: string;
  verdict_title: string;
  verdict_subtitle: string;
  verdict_summary: string;
  verdict_best_for: string;
  verdict_not_ideal_for: string;
  verdict_recommendation: string;
  verdict_conclusion: string;
  buying_guide_title: string;
  buying_guide_subtitle: string;
  buying_cta_label: string;
  buying_guide_items: string;
  related_product_ids: string[];
  compare_product_ids: string[];
  related_blog_ids: string[];
  related_ingredient_ids: string[];
  related_ingredients_title: string;
  related_ingredients_subtitle: string;
  related_blogs_title: string;
  related_blogs_subtitle: string;
  compare_title: string;
  compare_subtitle: string;
  related_products_title: string;
  related_products_subtitle: string;
  health_needs_title: string;
  health_needs_subtitle: string;
  sidebar_facts: string;
  sidebar_cta_title: string;
  sidebar_cta_description: string;
  sidebar_cta_label: string;
  ingredient_overrides: string;
  status: ContentStatus;
  seo_title: string;
  seo_description: string;
  seo_canonical_url: string;
  seo_og_title: string;
  seo_og_description: string;
  seo_og_image: string;
  seo_noindex: boolean;
  schema_json: string;
};

type ProductsResponse = {
  products?: Product[];
  product?: Product;
  error?: string;
};

type CategoriesResponse = {
  categories?: Category[];
  error?: string;
};

type IngredientsResponse = {
  ingredients?: Ingredient[];
  error?: string;
};

type BlogsResponse = {
  blogs?: Blog[];
  error?: string;
};

type ExpertProfilesResponse = {
  authors?: Author[];
  reviewers?: Reviewer[];
  error?: string;
};

const emptyForm: ProductFormState = {
  title: "",
  slug: "",
  hero_badge: "",
  hero_title: "",
  hero_subtitle: "",
  hero_description: "",
  hero_image_alt: "",
  hero_cta_label: "",
  hero_cta_target: "_blank",
  hero_secondary_cta_label: "",
  hero_secondary_cta_target: "_blank",
  hero_checklist: "",
  hero_show_rating: true,
  hero_show_badge: true,
  review_count: "",
  rating_label: "",
  category_id: "",
  author_id: "",
  reviewer_id: "",
  ingredient_ids: [],
  short_description: "",
  full_description: "",
  image: "",
  gallery: [],
  rating: "",
  affiliate_url: "",
  benefits: "",
  pros: "",
  cons: "",
  faq: "",
  overview_title: "",
  overview_subtitle: "",
  overview_content: "",
  how_it_works_title: "",
  how_it_works_subtitle: "",
  how_it_works_content: "",
  how_it_works_steps: "",
  benefits_title: "",
  benefits_subtitle: "",
  ingredients_title: "",
  ingredients_subtitle: "",
  best_for_title: "",
  best_for_subtitle: "",
  best_for_items: "",
  standout_points: "",
  safety_title: "",
  safety_subtitle: "",
  safety_items: "",
  pros_cons_title: "",
  pros_cons_subtitle: "",
  faq_title: "",
  faq_subtitle: "",
  verdict_title: "",
  verdict_subtitle: "",
  verdict_summary: "",
  verdict_best_for: "",
  verdict_not_ideal_for: "",
  verdict_recommendation: "",
  verdict_conclusion: "",
  buying_guide_title: "",
  buying_guide_subtitle: "",
  buying_cta_label: "",
  buying_guide_items: "",
  related_product_ids: [],
  compare_product_ids: [],
  related_blog_ids: [],
  related_ingredient_ids: [],
  related_ingredients_title: "",
  related_ingredients_subtitle: "",
  related_blogs_title: "",
  related_blogs_subtitle: "",
  compare_title: "",
  compare_subtitle: "",
  related_products_title: "",
  related_products_subtitle: "",
  health_needs_title: "",
  health_needs_subtitle: "",
  sidebar_facts: "",
  sidebar_cta_title: "",
  sidebar_cta_description: "",
  sidebar_cta_label: "",
  ingredient_overrides: "",
  status: ContentStatus.Draft,
  seo_title: "",
  seo_description: "",
  seo_canonical_url: "",
  seo_og_title: "",
  seo_og_description: "",
  seo_og_image: "",
  seo_noindex: false,
  schema_json: "",
};

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function safeStringArray(value: string[] | null | undefined): string[] {
  return safeArray(value).filter((item): item is string => typeof item === "string");
}

function safeJsonArray(value: JsonValue[] | null | undefined): JsonValue[] {
  return Array.isArray(value) ? value : [];
}

function parseBenefits(value: string): JsonValue[] {
  return lines(value).map((item, index) => {
    const [title, description = "", icon = ""] = item.split("|").map((part) => part.trim());

    return { title, description, icon: icon || null, display_order: index, is_active: true };
  });
}

function parseFaq(value: string): FAQItem[] {
  return lines(value).map((item, index) => {
    const [question, answer = "", visibility = "visible"] = item
      .split("|")
      .map((part) => part.trim());
    const isHidden = ["false", "hidden", "no", "0"].includes(visibility.toLowerCase());

    return { question, answer, display_order: index, is_visible: !isHidden };
  });
}

function serializeCmsCards(
  items?: Array<{
    title?: string | null;
    description?: string | null;
    icon?: string | null;
  }>,
) {
  return (items ?? [])
    .map((item) =>
      [item.title ?? "", item.description ?? "", item.icon ?? ""]
        .map((part) => part.trim())
        .join(" | ")
        .replace(/(?:\s\|\s)*$/g, ""),
    )
    .filter(Boolean)
    .join("\n");
}

function parseCmsCards(value: string) {
  return lines(value).map((item, index) => {
    const [title, description = "", icon = ""] = item.split("|").map((part) => part.trim());

    return {
      title,
      description: description || null,
      icon: icon || null,
      display_order: index,
      is_active: true,
    };
  });
}

function serializeHowItWorksSteps(
  items?: Array<{
    title?: string | null;
    description?: string | null;
    icon?: string | null;
  }>,
) {
  return (items ?? [])
    .map((item) =>
      [item.title ?? "", item.description ?? "", item.icon ?? ""]
        .map((part) => part.trim())
        .join(" | ")
        .replace(/(?:\s\|\s)*$/g, ""),
    )
    .filter(Boolean)
    .join("\n");
}

function parseHowItWorksSteps(value: string) {
  return lines(value)
    .map((item, index) => {
      const [title, description = "", icon = ""] = item.split("|").map((part) => part.trim());
      const resolvedDescription = description || title;

      return {
        title: description ? title || null : null,
        description: resolvedDescription,
        icon: icon || null,
        display_order: index,
        is_active: true,
      };
    })
    .filter((item) => item.description);
}

function serializeSafetyItems(
  items?: Array<{
    item_type?: string | null;
    title?: string | null;
    description?: string | null;
    icon?: string | null;
  }>,
) {
  return (items ?? [])
    .map((item) =>
      [item.item_type ?? "", item.title ?? "", item.description ?? "", item.icon ?? ""]
        .map((part) => part.trim())
        .join(" | ")
        .replace(/(?:\s\|\s)*$/g, ""),
    )
    .filter(Boolean)
    .join("\n");
}

function parseSafetyItems(value: string) {
  const allowedTypes = new Set(["side_effect", "who_should_avoid", "interaction", "precaution"]);

  return lines(value).map((item, index) => {
    const [itemType = "precaution", title = "", description = "", icon = ""] = item
      .split("|")
      .map((part) => part.trim());

    return {
      item_type: allowedTypes.has(itemType) ? itemType : "precaution",
      title,
      description: description || null,
      icon: icon || null,
      display_order: index,
      is_active: true,
    };
  });
}

function serializeSidebarFacts(
  items?: Array<{
    label?: string | null;
    value?: string | null;
    icon?: string | null;
  }>,
) {
  return (items ?? [])
    .map((item) =>
      [item.label ?? "", item.value ?? "", item.icon ?? ""]
        .map((part) => part.trim())
        .join(" | ")
        .replace(/(?:\s\|\s)*$/g, ""),
    )
    .filter(Boolean)
    .join("\n");
}

function parseSidebarFacts(value: string) {
  return lines(value).map((item, index) => {
    const [label, factValue = "", icon = ""] = item.split("|").map((part) => part.trim());

    return {
      label,
      value: factValue,
      icon: icon || null,
      display_order: index,
      is_active: true,
    };
  });
}

function serializeIngredientOverrides(
  items?: Array<{
    ingredient_id?: string | null;
    purpose?: string | null;
    dosage?: string | null;
    description_override?: string | null;
    custom_note?: string | null;
    is_highlighted?: boolean | null;
  }>,
) {
  return (items ?? [])
    .map((item) =>
      [
        item.ingredient_id ?? "",
        item.purpose ?? "",
        item.dosage ?? "",
        item.description_override ?? "",
        item.custom_note ?? "",
        item.is_highlighted ? "highlighted" : "",
      ]
        .map((part) => part.trim())
        .join(" | ")
        .replace(/(?:\s\|\s)*$/g, ""),
    )
    .filter(Boolean)
    .join("\n");
}

function parseIngredientOverrides(value: string) {
  return lines(value).map((item, index) => {
    const [
      ingredientId,
      purpose = "",
      dosage = "",
      descriptionOverride = "",
      customNote = "",
      highlighted = "",
    ] = item
      .split("|")
      .map((part) => part.trim());
    const isHighlighted = ["true", "yes", "1", "highlight", "highlighted"].includes(
      highlighted.toLowerCase(),
    );

    return {
      ingredient_id: ingredientId,
      purpose: purpose || null,
      dosage: dosage || null,
      description_override: descriptionOverride || null,
      custom_note: customNote || null,
      is_highlighted: isHighlighted,
      display_order: index,
    };
  });
}

function parseSchemaJson(value: string): JsonValue {
  if (!value.trim()) {
    return {};
  }

  return JSON.parse(value) as JsonValue;
}

function productToForm(product: Product): ProductFormState {
  const heroChecklist = safeStringArray(product.hero_checklist);
  const gallery = safeStringArray(product.gallery);
  const benefits = safeJsonArray(product.benefits);
  const pros = safeStringArray(product.pros);
  const cons = safeStringArray(product.cons);
  const faq = safeArray(product.faq);
  const ingredientIds = safeStringArray(product.ingredient_ids);
  const relatedProductRelations = safeArray(product.related_product_relations);
  const compareProductRelations = safeArray(product.compare_product_relations);
  const relatedBlogRelations = safeArray(product.related_blog_relations);
  const relatedIngredientRelations = safeArray(product.related_ingredient_relations);

  return {
    title: product.title,
    slug: product.slug,
    hero_badge: product.hero_badge ?? "",
    hero_title: product.hero_title ?? "",
    hero_subtitle: product.hero_subtitle ?? "",
    hero_description: product.hero_description ?? "",
    hero_image_alt: product.hero_image_alt ?? "",
    hero_cta_label: product.hero_cta_label ?? "",
    hero_cta_target: product.hero_cta_target ?? "_blank",
    hero_secondary_cta_label: product.hero_secondary_cta_label ?? "",
    hero_secondary_cta_target: product.hero_secondary_cta_target ?? "_blank",
    hero_checklist: heroChecklist.join("\n"),
    hero_show_rating: product.hero_show_rating,
    hero_show_badge: product.hero_show_badge,
    review_count: product.review_count?.toString() ?? "",
    rating_label: product.rating_label ?? "",
    category_id: product.category_id ?? "",
    author_id: product.author_id ?? "",
    reviewer_id: product.reviewer_id ?? "",
    ingredient_ids: ingredientIds,
    short_description: product.short_description ?? "",
    full_description: product.full_description ?? "",
    image: product.image ?? "",
    gallery,
    rating: product.rating?.toString() ?? "",
    affiliate_url: product.affiliate_url ?? "",
    benefits: benefits
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          const title = "title" in item && typeof item.title === "string" ? item.title : "";
          const description =
            "description" in item && typeof item.description === "string"
              ? item.description
              : "";
          const icon = "icon" in item && typeof item.icon === "string" ? item.icon : "";

          return [title, description, icon]
            .filter(Boolean)
            .join(" | ");
        }

        return String(item ?? "");
      })
      .join("\n"),
    pros: pros.join("\n"),
    cons: cons.join("\n"),
    faq: faq
      .map((item) =>
        [
          item.question,
          item.answer,
          item.is_visible === false ? "hidden" : "",
        ]
          .filter(Boolean)
          .join(" | "),
      )
      .join("\n"),
    overview_title: product.overview_title ?? "",
    overview_subtitle: product.overview_subtitle ?? "",
    overview_content: product.overview_content ?? "",
    how_it_works_title: product.how_it_works_title ?? "",
    how_it_works_subtitle: product.how_it_works_subtitle ?? "",
    how_it_works_content: product.how_it_works_content ?? "",
    how_it_works_steps: serializeHowItWorksSteps(product.how_it_works_steps),
    benefits_title: product.benefits_title ?? "",
    benefits_subtitle: product.benefits_subtitle ?? "",
    ingredients_title: product.ingredients_title ?? "",
    ingredients_subtitle: product.ingredients_subtitle ?? "",
    best_for_title: product.best_for_title ?? "",
    best_for_subtitle: product.best_for_subtitle ?? "",
    best_for_items: serializeCmsCards(product.best_for_items),
    standout_points: serializeCmsCards(product.standout_points),
    safety_title: product.safety_title ?? "",
    safety_subtitle: product.safety_subtitle ?? "",
    safety_items: serializeSafetyItems(product.safety_items),
    pros_cons_title: product.pros_cons_title ?? "",
    pros_cons_subtitle: product.pros_cons_subtitle ?? "",
    faq_title: product.faq_title ?? "",
    faq_subtitle: product.faq_subtitle ?? "",
    verdict_title: product.verdict_title ?? "",
    verdict_subtitle: product.verdict_subtitle ?? "",
    verdict_summary: product.verdict_summary ?? "",
    verdict_best_for: product.verdict_best_for ?? "",
    verdict_not_ideal_for: product.verdict_not_ideal_for ?? "",
    verdict_recommendation: product.verdict_recommendation ?? "",
    verdict_conclusion: product.verdict_conclusion ?? "",
    buying_guide_title: product.buying_guide_title ?? "",
    buying_guide_subtitle: product.buying_guide_subtitle ?? "",
    buying_cta_label: product.buying_cta_label ?? "",
    buying_guide_items: serializeCmsCards(product.buying_guide_items),
    related_product_ids:
      relatedProductRelations.map((item) => item.related_product_id).filter(Boolean),
    compare_product_ids:
      compareProductRelations.map((item) => item.compared_product_id).filter(Boolean),
    related_blog_ids: relatedBlogRelations.map((item) => item.blog_id).filter(Boolean),
    related_ingredient_ids:
      relatedIngredientRelations.map((item) => item.ingredient_id).filter(Boolean),
    related_ingredients_title: product.related_ingredients_title ?? "",
    related_ingredients_subtitle: product.related_ingredients_subtitle ?? "",
    related_blogs_title: product.related_blogs_title ?? "",
    related_blogs_subtitle: product.related_blogs_subtitle ?? "",
    compare_title: product.compare_title ?? "",
    compare_subtitle: product.compare_subtitle ?? "",
    related_products_title: product.related_products_title ?? "",
    related_products_subtitle: product.related_products_subtitle ?? "",
    health_needs_title: product.health_needs_title ?? "",
    health_needs_subtitle: product.health_needs_subtitle ?? "",
    sidebar_facts: serializeSidebarFacts(product.sidebar_facts),
    sidebar_cta_title: product.sidebar_cta_title ?? "",
    sidebar_cta_description: product.sidebar_cta_description ?? "",
    sidebar_cta_label: product.sidebar_cta_label ?? "",
    ingredient_overrides: serializeIngredientOverrides(product.ingredient_overrides),
    status: product.status,
    seo_title: product.seo_title ?? "",
    seo_description: product.seo_description ?? "",
    seo_canonical_url: product.seo_canonical_url ?? "",
    seo_og_title: product.seo_og_title ?? "",
    seo_og_description: product.seo_og_description ?? "",
    seo_og_image: product.seo_og_image ?? "",
    seo_noindex: product.seo_noindex,
    schema_json:
      product.schema_json && typeof product.schema_json === "object"
        ? JSON.stringify(product.schema_json, null, 2)
        : "",
  };
}

function formToPayload(form: ProductFormState) {
  const gallery = safeStringArray(form.gallery);
  const ingredientIds = safeStringArray(form.ingredient_ids);
  const relatedProductIds = safeStringArray(form.related_product_ids);
  const compareProductIds = safeStringArray(form.compare_product_ids);
  const relatedBlogIds = safeStringArray(form.related_blog_ids);
  const relatedIngredientIds = safeStringArray(form.related_ingredient_ids);

  return {
    title: form.title,
    slug: form.slug || undefined,
    hero_badge: form.hero_badge || null,
    hero_title: form.hero_title || null,
    hero_subtitle: form.hero_subtitle || null,
    hero_description: form.hero_description || null,
    hero_image_alt: form.hero_image_alt || null,
    hero_cta_label: form.hero_cta_label || null,
    hero_cta_target: form.hero_cta_target,
    hero_secondary_cta_label: form.hero_secondary_cta_label || null,
    hero_secondary_cta_target: form.hero_secondary_cta_target,
    hero_checklist: lines(form.hero_checklist),
    hero_show_rating: form.hero_show_rating,
    hero_show_badge: form.hero_show_badge,
    review_count: form.review_count ? Number(form.review_count) : null,
    rating_label: form.rating_label || null,
    category_id: form.category_id || null,
    author_id: form.author_id || null,
    reviewer_id: form.reviewer_id || null,
    ingredient_ids: ingredientIds,
    short_description: form.short_description || null,
    full_description: form.full_description || null,
    image: form.image || null,
    gallery: [...new Set(gallery.map((item) => item.trim()).filter(Boolean))],
    rating: form.rating ? Number(form.rating) : null,
    affiliate_url: form.affiliate_url || null,
    benefits: parseBenefits(form.benefits),
    pros: lines(form.pros),
    cons: lines(form.cons),
    faq: parseFaq(form.faq),
    overview_title: form.overview_title || null,
    overview_subtitle: form.overview_subtitle || null,
    overview_content: form.overview_content || null,
    how_it_works_title: form.how_it_works_title || null,
    how_it_works_subtitle: form.how_it_works_subtitle || null,
    how_it_works_content: form.how_it_works_content || null,
    how_it_works_steps: parseHowItWorksSteps(form.how_it_works_steps),
    benefits_title: form.benefits_title || null,
    benefits_subtitle: form.benefits_subtitle || null,
    ingredients_title: form.ingredients_title || null,
    ingredients_subtitle: form.ingredients_subtitle || null,
    best_for_title: form.best_for_title || null,
    best_for_subtitle: form.best_for_subtitle || null,
    best_for_items: parseCmsCards(form.best_for_items),
    standout_points: parseCmsCards(form.standout_points),
    safety_title: form.safety_title || null,
    safety_subtitle: form.safety_subtitle || null,
    safety_items: parseSafetyItems(form.safety_items),
    pros_cons_title: form.pros_cons_title || null,
    pros_cons_subtitle: form.pros_cons_subtitle || null,
    faq_title: form.faq_title || null,
    faq_subtitle: form.faq_subtitle || null,
    verdict_title: form.verdict_title || null,
    verdict_subtitle: form.verdict_subtitle || null,
    verdict_summary: form.verdict_summary || null,
    verdict_best_for: form.verdict_best_for || null,
    verdict_not_ideal_for: form.verdict_not_ideal_for || null,
    verdict_recommendation: form.verdict_recommendation || null,
    verdict_conclusion: form.verdict_conclusion || null,
    buying_guide_title: form.buying_guide_title || null,
    buying_guide_subtitle: form.buying_guide_subtitle || null,
    buying_cta_label: form.buying_cta_label || null,
    buying_guide_items: parseCmsCards(form.buying_guide_items),
    related_product_relations: relatedProductIds.map((productId, index) => ({
      related_product_id: productId,
      relationship_type: "related",
      display_order: index,
      title_override: null,
      description_override: null,
    })),
    compare_product_relations: compareProductIds.map((productId, index) => ({
      compared_product_id: productId,
      display_order: index,
      title_override: null,
      description_override: null,
    })),
    related_blog_relations: relatedBlogIds.map((blogId, index) => ({
      blog_id: blogId,
      display_order: index,
      title_override: null,
      description_override: null,
    })),
    related_ingredient_relations: relatedIngredientIds.map((ingredientId, index) => ({
      ingredient_id: ingredientId,
      display_order: index,
      title_override: null,
      description_override: null,
    })),
    related_ingredients_title: form.related_ingredients_title || null,
    related_ingredients_subtitle: form.related_ingredients_subtitle || null,
    related_blogs_title: form.related_blogs_title || null,
    related_blogs_subtitle: form.related_blogs_subtitle || null,
    compare_title: form.compare_title || null,
    compare_subtitle: form.compare_subtitle || null,
    related_products_title: form.related_products_title || null,
    related_products_subtitle: form.related_products_subtitle || null,
    health_needs_title: form.health_needs_title || null,
    health_needs_subtitle: form.health_needs_subtitle || null,
    sidebar_facts: parseSidebarFacts(form.sidebar_facts),
    sidebar_cta_title: form.sidebar_cta_title || null,
    sidebar_cta_description: form.sidebar_cta_description || null,
    sidebar_cta_label: form.sidebar_cta_label || null,
    ingredient_overrides: parseIngredientOverrides(form.ingredient_overrides),
    status: form.status,
    seo_title: form.seo_title || null,
    seo_description: form.seo_description || null,
    seo_canonical_url: form.seo_canonical_url || null,
    seo_og_title: form.seo_og_title || null,
    seo_og_description: form.seo_og_description || null,
    seo_og_image: form.seo_og_image || null,
    seo_noindex: form.seo_noindex,
    schema_json: parseSchemaJson(form.schema_json),
  };
}

function getCategoryTitle(categories: Category[], categoryId: string | null) {
  if (!categoryId) {
    return "Unassigned";
  }

  return categories.find((category) => category.id === categoryId)?.title ?? "Unknown category";
}

export function DashboardProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isIngredientsLoading, setIsIngredientsLoading] = useState(true);
  const [isBlogsLoading, setIsBlogsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const payload = (await response.json()) as ProductsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load products.");
      }

      setProducts(payload.products ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);

    try {
      const response = await fetch("/api/categories", { cache: "no-store" });
      const payload = (await response.json()) as CategoriesResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load categories.");
      }

      setCategories(payload.categories ?? []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to load categories.",
      );
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  const fetchIngredients = useCallback(async () => {
    setIsIngredientsLoading(true);

    try {
      const response = await fetch("/api/ingredients", { cache: "no-store" });
      const payload = (await response.json()) as IngredientsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load ingredients.");
      }

      setIngredients(payload.ingredients ?? []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to load ingredients.",
      );
    } finally {
      setIsIngredientsLoading(false);
    }
  }, []);

  const fetchBlogs = useCallback(async () => {
    setIsBlogsLoading(true);

    try {
      const response = await fetch("/api/blogs", { cache: "no-store" });
      const payload = (await response.json()) as BlogsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load blogs.");
      }

      setBlogs(payload.blogs ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load blogs.");
    } finally {
      setIsBlogsLoading(false);
    }
  }, []);

  const fetchExpertProfiles = useCallback(async () => {
    try {
      const [authorsResponse, reviewersResponse] = await Promise.all([
        fetch("/api/authors?active=true", { cache: "no-store" }),
        fetch("/api/reviewers?active=true", { cache: "no-store" }),
      ]);
      const authorsPayload = (await authorsResponse.json()) as ExpertProfilesResponse;
      const reviewersPayload = (await reviewersResponse.json()) as ExpertProfilesResponse;

      if (!authorsResponse.ok) {
        throw new Error(authorsPayload.error ?? "Unable to load authors.");
      }

      if (!reviewersResponse.ok) {
        throw new Error(reviewersPayload.error ?? "Unable to load reviewers.");
      }

      setAuthors(authorsPayload.authors ?? []);
      setReviewers(reviewersPayload.reviewers ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load EEAT profiles.");
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
    void fetchIngredients();
    void fetchBlogs();
    void fetchExpertProfiles();
  }, [fetchBlogs, fetchCategories, fetchExpertProfiles, fetchIngredients, fetchProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [
        product.title,
        product.slug,
        product.status,
        product.short_description ?? "",
        getCategoryTitle(categories, product.category_id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [categories, products, search]);

  function updateForm<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function openCreateForm() {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setForm(productToForm(product));
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        editingProduct ? `/api/products/${editingProduct.id}` : "/api/products",
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formToPayload(form)),
        },
      );
      const payload = (await response.json()) as ProductsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save product.");
      }

      setSuccess(editingProduct ? "Product updated successfully." : "Product created successfully.");
      setIsFormOpen(false);
      setEditingProduct(null);
      setForm(emptyForm);
      await fetchProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const shouldDelete = window.confirm(`Delete ${product.title}? This will soft delete it.`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const payload = (await response.json()) as ProductsResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete product.");
      }

      setSuccess("Product deleted successfully.");
      await fetchProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete product.");
    }
  }

  return (
    <div className="space-y-6">
      <DashboardCard title="Product Library">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
            <Search className="size-4 text-primary" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void fetchProducts()}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
            <Link
              href="/dashboard/products/bulk-import"
              className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
            >
              <Plus className="size-4" />
              Bulk Import
            </Link>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
            >
              <Plus className="size-4" />
              Add Product
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-[20px] border border-primary/15 bg-soft-green px-4 py-3 text-sm font-medium text-primary">
            {success}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-[24px] border border-border-light">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-soft-green font-heading text-text-dark">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Rating</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      Loading products...
                    </span>
                  </td>
                </tr>
              ) : filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-border-light">
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-heading font-semibold text-text-dark">
                          {product.title}
                        </span>
                        <p className="mt-1 text-xs text-muted">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {getCategoryTitle(categories, product.category_id)}
                    </td>
                    <td className="px-5 py-4 text-muted">{product.rating ?? "Not rated"}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-pill bg-soft-green px-3 py-1.5 text-xs font-semibold capitalize text-primary">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          className="inline-flex items-center gap-1.5 rounded-pill border border-border-light px-4 py-2 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteProduct(product)}
                          className="inline-flex items-center gap-1.5 rounded-pill border border-red-200 px-4 py-2 font-heading text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {isFormOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-border-light bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-extrabold text-text-dark">
                {editingProduct ? "Edit Product" : "Create Product"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Add Supabase-ready product content, affiliate fields, and SEO metadata.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full border border-border-light p-2 text-muted transition hover:border-gold/60 hover:text-primary"
              aria-label="Close product form"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submitProduct} className="grid gap-4 lg:grid-cols-2">
            <InputField label="Title" value={form.title} onChange={(value) => updateForm("title", value)} required />
            <InputField label="Slug" value={form.slug} onChange={(value) => updateForm("slug", value)} placeholder="auto-generated if empty" />
            <CategorySelect
              value={form.category_id}
              categories={categories}
              isLoading={isCategoriesLoading}
              onChange={(value) => updateForm("category_id", value)}
            />
            <InputField label="Rating" value={form.rating} onChange={(value) => updateForm("rating", value)} placeholder="4.8" />
            <ProfileSelect
              label="Author"
              value={form.author_id}
              options={authors}
              onChange={(value) => updateForm("author_id", value)}
            />
            <ProfileSelect
              label="Reviewer"
              value={form.reviewer_id}
              options={reviewers}
              onChange={(value) => updateForm("reviewer_id", value)}
            />
            <MediaLibraryField
              label="Product Image"
              value={form.image}
              onChange={(value) => updateForm("image", value)}
              className="lg:col-span-2"
              helperText="Select a primary product visual from the Media Library."
            />
            <InputField label="Affiliate URL" value={form.affiliate_url} onChange={(value) => updateForm("affiliate_url", value)} />
            <InputField label="SEO Title" value={form.seo_title} onChange={(value) => updateForm("seo_title", value)} />
            <label className="grid gap-2">
              <span className="font-heading text-sm font-semibold text-text-dark">Status</span>
              <select
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value as ContentStatus)}
                className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
              >
                <option value={ContentStatus.Draft}>Draft</option>
                <option value={ContentStatus.Published}>Published</option>
                <option value={ContentStatus.Archived}>Archived</option>
              </select>
            </label>
            <TextAreaField label="Short Description" value={form.short_description} onChange={(value) => updateForm("short_description", value)} />
            <TextAreaField label="SEO Description" value={form.seo_description} onChange={(value) => updateForm("seo_description", value)} />
            <TextAreaField label="Full Description" value={form.full_description} onChange={(value) => updateForm("full_description", value)} className="lg:col-span-2" rows={4} />
            <MediaGalleryField
              label="Product Gallery"
              values={form.gallery}
              onChange={(value) => updateForm("gallery", value)}
              helperText="Optional secondary product images pulled directly from the Media Library."
            />
            <IngredientMultiSelect
              ingredients={ingredients}
              isLoading={isIngredientsLoading}
              selectedIngredientIds={form.ingredient_ids}
              onChange={(value) => updateForm("ingredient_ids", value)}
              errorMessage={
                error.toLowerCase().includes("ingredient")
                  ? error
                  : ""
              }
              className="lg:col-span-2"
            />
            <TextAreaField label="Pros" value={form.pros} onChange={(value) => updateForm("pros", value)} placeholder="One item per line" />
            <TextAreaField label="Cons" value={form.cons} onChange={(value) => updateForm("cons", value)} placeholder="One item per line" />
            <TextAreaField label="Benefits" value={form.benefits} onChange={(value) => updateForm("benefits", value)} placeholder="Title | Description | icon, one per line" />
            <TextAreaField label="FAQ" value={form.faq} onChange={(value) => updateForm("faq", value)} placeholder="Question | Answer | visible, one per line" />

            <CmsSection
              title="Hero"
              description="Foundation fields for the product hero. Public rendering will connect in a later phase."
            >
              <InputField label="Hero Badge" value={form.hero_badge} onChange={(value) => updateForm("hero_badge", value)} />
              <InputField label="Hero Title Override" value={form.hero_title} onChange={(value) => updateForm("hero_title", value)} />
              <InputField label="Hero Subtitle" value={form.hero_subtitle} onChange={(value) => updateForm("hero_subtitle", value)} />
              <InputField label="Hero CTA Label" value={form.hero_cta_label} onChange={(value) => updateForm("hero_cta_label", value)} />
              <TargetSelect
                label="Hero CTA Target"
                value={form.hero_cta_target}
                onChange={(value) => updateForm("hero_cta_target", value)}
              />
              <InputField label="Secondary CTA Label" value={form.hero_secondary_cta_label} onChange={(value) => updateForm("hero_secondary_cta_label", value)} />
              <TargetSelect
                label="Secondary CTA Target"
                value={form.hero_secondary_cta_target}
                onChange={(value) => updateForm("hero_secondary_cta_target", value)}
              />
              <InputField label="Rating Label" value={form.rating_label} onChange={(value) => updateForm("rating_label", value)} />
              <InputField label="Review Count" value={form.review_count} onChange={(value) => updateForm("review_count", value)} />
              <InputField label="Hero Image Alt Text" value={form.hero_image_alt} onChange={(value) => updateForm("hero_image_alt", value)} />
              <TextAreaField label="Hero Description" value={form.hero_description} onChange={(value) => updateForm("hero_description", value)} className="lg:col-span-2" rows={4} />
              <TextAreaField label="Hero Checklist" value={form.hero_checklist} onChange={(value) => updateForm("hero_checklist", value)} placeholder="Icon | Text, one checklist item per line" />
              <TextAreaField label="Hero Highlight Cards" value={form.standout_points} onChange={(value) => updateForm("standout_points", value)} placeholder="Title | Description | icon, one per line" rows={4} />
              <div className="grid gap-3">
                <CheckboxField label="Show Rating" checked={form.hero_show_rating} onChange={(value) => updateForm("hero_show_rating", value)} />
                <CheckboxField label="Show Hero Badge" checked={form.hero_show_badge} onChange={(value) => updateForm("hero_show_badge", value)} />
              </div>
            </CmsSection>

            <CmsSection title="Overview & Education">
              <InputField label="Overview Title" value={form.overview_title} onChange={(value) => updateForm("overview_title", value)} />
              <InputField label="Overview Subtitle" value={form.overview_subtitle} onChange={(value) => updateForm("overview_subtitle", value)} />
              <TextAreaField label="Overview Content" value={form.overview_content} onChange={(value) => updateForm("overview_content", value)} className="lg:col-span-2" rows={5} />
              <InputField label="How It Works Title" value={form.how_it_works_title} onChange={(value) => updateForm("how_it_works_title", value)} />
              <InputField label="How It Works Subtitle" value={form.how_it_works_subtitle} onChange={(value) => updateForm("how_it_works_subtitle", value)} />
              <TextAreaField label="How It Works Content" value={form.how_it_works_content} onChange={(value) => updateForm("how_it_works_content", value)} rows={4} />
              <TextAreaField label="How It Works Steps" value={form.how_it_works_steps} onChange={(value) => updateForm("how_it_works_steps", value)} placeholder="Title | Description | icon, one per line" rows={4} />
            </CmsSection>

            <CmsSection title="Content Sections">
              <InputField label="Benefits Title" value={form.benefits_title} onChange={(value) => updateForm("benefits_title", value)} />
              <InputField label="Benefits Subtitle" value={form.benefits_subtitle} onChange={(value) => updateForm("benefits_subtitle", value)} />
              <InputField label="Ingredients Title" value={form.ingredients_title} onChange={(value) => updateForm("ingredients_title", value)} />
              <InputField label="Ingredients Subtitle" value={form.ingredients_subtitle} onChange={(value) => updateForm("ingredients_subtitle", value)} />
              <InputField label="Best For Title" value={form.best_for_title} onChange={(value) => updateForm("best_for_title", value)} />
              <InputField label="Best For Subtitle" value={form.best_for_subtitle} onChange={(value) => updateForm("best_for_subtitle", value)} />
              <TextAreaField label="Best For Cards" value={form.best_for_items} onChange={(value) => updateForm("best_for_items", value)} placeholder="Title | Description | icon, one per line" rows={4} />
            </CmsSection>

            <CmsSection title="Safety, FAQ & Verdict">
              <InputField label="Safety Title" value={form.safety_title} onChange={(value) => updateForm("safety_title", value)} />
              <InputField label="Safety Subtitle" value={form.safety_subtitle} onChange={(value) => updateForm("safety_subtitle", value)} />
              <InputField label="Pros & Cons Title" value={form.pros_cons_title} onChange={(value) => updateForm("pros_cons_title", value)} />
              <InputField label="Pros & Cons Subtitle" value={form.pros_cons_subtitle} onChange={(value) => updateForm("pros_cons_subtitle", value)} />
              <InputField label="FAQ Title" value={form.faq_title} onChange={(value) => updateForm("faq_title", value)} />
              <InputField label="FAQ Subtitle" value={form.faq_subtitle} onChange={(value) => updateForm("faq_subtitle", value)} />
              <TextAreaField label="Safety Items" value={form.safety_items} onChange={(value) => updateForm("safety_items", value)} placeholder="side_effect | Title | Description | icon" className="lg:col-span-2" rows={5} />
              <InputField label="Verdict Title" value={form.verdict_title} onChange={(value) => updateForm("verdict_title", value)} />
              <InputField label="Verdict Subtitle" value={form.verdict_subtitle} onChange={(value) => updateForm("verdict_subtitle", value)} />
              <TextAreaField label="Verdict Summary" value={form.verdict_summary} onChange={(value) => updateForm("verdict_summary", value)} rows={4} />
              <TextAreaField label="Verdict Recommendation" value={form.verdict_recommendation} onChange={(value) => updateForm("verdict_recommendation", value)} rows={4} />
              <InputField label="Verdict Best For" value={form.verdict_best_for} onChange={(value) => updateForm("verdict_best_for", value)} />
              <InputField label="Verdict Not Ideal For" value={form.verdict_not_ideal_for} onChange={(value) => updateForm("verdict_not_ideal_for", value)} />
              <TextAreaField label="Verdict Conclusion" value={form.verdict_conclusion} onChange={(value) => updateForm("verdict_conclusion", value)} className="lg:col-span-2" rows={3} />
            </CmsSection>

            <CmsSection title="Buying Guide, Sidebar & Navigation">
              <InputField label="Buying Guide Title" value={form.buying_guide_title} onChange={(value) => updateForm("buying_guide_title", value)} />
              <InputField label="Buying Guide Subtitle" value={form.buying_guide_subtitle} onChange={(value) => updateForm("buying_guide_subtitle", value)} />
              <InputField label="Buying CTA Label" value={form.buying_cta_label} onChange={(value) => updateForm("buying_cta_label", value)} />
              <InputField label="Sidebar CTA Label" value={form.sidebar_cta_label} onChange={(value) => updateForm("sidebar_cta_label", value)} />
              <TextAreaField label="Buying Guide Items" value={form.buying_guide_items} onChange={(value) => updateForm("buying_guide_items", value)} placeholder="Title | Description | icon, one per line" rows={4} />
              <TextAreaField label="Sidebar Facts" value={form.sidebar_facts} onChange={(value) => updateForm("sidebar_facts", value)} placeholder="Label | Value | icon, one per line" rows={4} />
              <InputField label="Sidebar CTA Title" value={form.sidebar_cta_title} onChange={(value) => updateForm("sidebar_cta_title", value)} />
              <InputField label="Sidebar CTA Description" value={form.sidebar_cta_description} onChange={(value) => updateForm("sidebar_cta_description", value)} />
            </CmsSection>

            <CmsSection title="Related Content">
              <InputField label="Related Ingredients Title" value={form.related_ingredients_title} onChange={(value) => updateForm("related_ingredients_title", value)} />
              <InputField label="Related Ingredients Subtitle" value={form.related_ingredients_subtitle} onChange={(value) => updateForm("related_ingredients_subtitle", value)} />
              <InputField label="Related Blogs Title" value={form.related_blogs_title} onChange={(value) => updateForm("related_blogs_title", value)} />
              <InputField label="Related Blogs Subtitle" value={form.related_blogs_subtitle} onChange={(value) => updateForm("related_blogs_subtitle", value)} />
              <InputField label="Compare Title" value={form.compare_title} onChange={(value) => updateForm("compare_title", value)} />
              <InputField label="Compare Subtitle" value={form.compare_subtitle} onChange={(value) => updateForm("compare_subtitle", value)} />
              <InputField label="Related Products Title" value={form.related_products_title} onChange={(value) => updateForm("related_products_title", value)} />
              <InputField label="Related Products Subtitle" value={form.related_products_subtitle} onChange={(value) => updateForm("related_products_subtitle", value)} />
              <InputField label="Health Needs Title" value={form.health_needs_title} onChange={(value) => updateForm("health_needs_title", value)} />
              <InputField label="Health Needs Subtitle" value={form.health_needs_subtitle} onChange={(value) => updateForm("health_needs_subtitle", value)} />
              <RelationshipMultiSelect
                label="Related Products"
                options={products
                  .filter((product) => product.id !== editingProduct?.id)
                  .map((product) => ({
                    id: product.id,
                    label: product.title,
                    description: product.slug,
                  }))}
                selectedIds={form.related_product_ids}
                onChange={(value) => updateForm("related_product_ids", value)}
              />
              <RelationshipMultiSelect
                label="Compare Alternatives"
                options={products
                  .filter((product) => product.id !== editingProduct?.id)
                  .map((product) => ({
                    id: product.id,
                    label: product.title,
                    description: product.slug,
                  }))}
                selectedIds={form.compare_product_ids}
                onChange={(value) => updateForm("compare_product_ids", value)}
              />
              <RelationshipMultiSelect
                label="Related Blogs"
                isLoading={isBlogsLoading}
                options={blogs.map((blog) => ({
                  id: blog.id,
                  label: blog.title,
                  description: blog.slug,
                }))}
                selectedIds={form.related_blog_ids}
                onChange={(value) => updateForm("related_blog_ids", value)}
              />
              <RelationshipMultiSelect
                label="Related Ingredients"
                isLoading={isIngredientsLoading}
                options={ingredients.map((ingredient) => ({
                  id: ingredient.id,
                  label: ingredient.name,
                  description: ingredient.slug,
                }))}
                selectedIds={form.related_ingredient_ids}
                onChange={(value) => updateForm("related_ingredient_ids", value)}
              />
              <TextAreaField label="Ingredient Display Overrides" value={form.ingredient_overrides} onChange={(value) => updateForm("ingredient_overrides", value)} placeholder="ingredient_id | Purpose | Dosage | Description override | Custom note | highlighted" className="lg:col-span-2" rows={4} />
            </CmsSection>

            <CmsSection title="Advanced SEO">
              <InputField label="Canonical URL" value={form.seo_canonical_url} onChange={(value) => updateForm("seo_canonical_url", value)} />
              <InputField label="Open Graph Title" value={form.seo_og_title} onChange={(value) => updateForm("seo_og_title", value)} />
              <InputField label="Open Graph Description" value={form.seo_og_description} onChange={(value) => updateForm("seo_og_description", value)} />
              <InputField label="Open Graph Image" value={form.seo_og_image} onChange={(value) => updateForm("seo_og_image", value)} />
              <CheckboxField label="Noindex product page" checked={form.seo_noindex} onChange={(value) => updateForm("seo_noindex", value)} />
              <TextAreaField label="Schema JSON Override" value={form.schema_json} onChange={(value) => updateForm("schema_json", value)} placeholder='{"@type":"Product"}' className="lg:col-span-2" rows={6} />
            </CmsSection>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-pill border border-border-light px-6 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}

function TargetSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "_self" | "_blank";
  onChange: (value: "_self" | "_blank") => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as "_self" | "_blank")}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      >
        <option value="_blank">New tab</option>
        <option value="_self">Same tab</option>
      </select>
    </label>
  );
}

function CmsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-[26px] border border-border-light bg-soft-green/35 p-4 lg:col-span-2 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <h3 className="font-heading text-base font-extrabold text-text-dark">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-[18px] border border-border-light bg-white px-4 text-sm font-semibold text-text-dark">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}

function RelationshipMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  isLoading = false,
}: {
  label: string;
  options: Array<{ id: string; label: string; description?: string }>;
  selectedIds: string[];
  onChange: (value: string[]) => void;
  isLoading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedOptions = useMemo(
    () => selectedIds.map((id) => options.find((option) => option.id === id)).filter(Boolean) as Array<{ id: string; label: string; description?: string }>,
    [options, selectedIds],
  );
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return options.filter((option) => {
      if (selectedIdSet.has(option.id)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [option.label, option.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [options, query, selectedIdSet]);

  function addOption(id: string) {
    if (selectedIdSet.has(id)) {
      return;
    }

    onChange([...selectedIds, id]);
    setQuery("");
    setIsOpen(true);
  }

  function removeOption(id: string) {
    onChange(selectedIds.filter((selectedId) => selectedId !== id));
  }

  return (
    <label className="relative grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <div className="rounded-[18px] border border-border-light bg-white p-3">
        {selectedOptions.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-2 rounded-pill bg-soft-green px-3 py-2 text-xs font-semibold text-primary"
              >
                <span>{option.label}</span>
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="rounded-full text-primary/80 transition hover:text-primary"
                  aria-label={`Remove ${option.label}`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-sm text-muted">No {label.toLowerCase()} selected.</p>
        )}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
          <input
            value={query}
            onBlur={() => {
              window.setTimeout(() => {
                setIsOpen(false);
                setQuery("");
              }, 120);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={isLoading ? `Loading ${label.toLowerCase()}...` : `Search ${label.toLowerCase()}`}
            className="min-h-12 w-full rounded-[14px] border border-border-light bg-white px-11 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80"
          />
        </div>
        {isOpen ? (
          <div className="mt-3 max-h-64 overflow-y-auto rounded-[18px] border border-border-light bg-white p-2 shadow-[0_20px_52px_rgba(15,23,42,0.12)]">
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted">
                <Loader2 className="size-4 animate-spin text-primary" />
                Loading...
              </div>
            ) : filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addOption(option.id)}
                  className="flex w-full items-start justify-between gap-3 rounded-[14px] px-3 py-3 text-left transition hover:bg-soft-green"
                >
                  <span>
                    <span className="block font-heading text-sm font-semibold text-text-dark">
                      {option.label}
                    </span>
                    {option.description ? (
                      <span className="block text-xs text-muted">{option.description}</span>
                    ) : null}
                  </span>
                  <span className="text-xs font-semibold text-primary">Add</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-muted">No options found.</div>
            )}
          </div>
        ) : null}
      </div>
      <span className="text-xs text-muted">
        {selectedIds.length} selected
      </span>
    </label>
  );
}

function ProfileSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<Author | Reviewer>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      >
        <option value="">Use default profile</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
            {option.designation ? ` - ${option.designation}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function CategorySelect({
  categories,
  isLoading,
  onChange,
  value,
}: {
  categories: Category[];
  isLoading: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  const selectedCategory = categories.find((category) => category.id === value);
  const [query, setQuery] = useState(selectedCategory?.title ?? "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(selectedCategory?.title ?? "");
  }, [selectedCategory?.title]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery || selectedCategory?.title === query) {
      return categories;
    }

    return categories.filter((category) =>
      [category.title, category.name, category.slug]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [categories, query, selectedCategory?.title]);

  return (
    <label className="relative grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">Category</span>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary"
          aria-hidden="true"
        />
        <input
          value={query}
          onBlur={() => {
            window.setTimeout(() => {
              setIsOpen(false);
              setQuery(selectedCategory?.title ?? "");
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery(selectedCategory?.title ?? "");
          }}
          placeholder={isLoading ? "Loading categories..." : "Search and select category"}
          className="min-h-12 w-full rounded-[18px] border border-border-light bg-white px-11 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
        />
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[76px] z-20 max-h-64 overflow-y-auto rounded-[20px] border border-border-light bg-white p-2 shadow-[0_20px_52px_rgba(15,23,42,0.12)]">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted">
              <Loader2 className="size-4 animate-spin text-primary" />
              Loading categories...
            </div>
          ) : filteredCategories.length ? (
            filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(category.id);
                  setQuery(category.title);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-[16px] px-3 py-3 text-left text-sm transition hover:bg-soft-green ${
                  category.id === value ? "bg-soft-green text-primary" : "text-text-dark"
                }`}
              >
                <span className="font-heading font-semibold">{category.title}</span>
                <span className="text-xs capitalize text-muted">{category.status}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-muted">No categories found.</div>
          )}
        </div>
      ) : null}

      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange("");
            setQuery("");
          }}
          className="w-fit font-heading text-xs font-semibold text-muted transition hover:text-primary"
        >
          Clear category
        </button>
      ) : null}
    </label>
  );
}

function IngredientMultiSelect({
  ingredients,
  isLoading,
  selectedIngredientIds,
  onChange,
  errorMessage,
  className = "",
}: {
  ingredients: Ingredient[];
  isLoading: boolean;
  selectedIngredientIds: string[];
  onChange: (value: string[]) => void;
  errorMessage?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selectedIngredients = useMemo(
    () =>
      selectedIngredientIds
        .map((ingredientId) => ingredients.find((ingredient) => ingredient.id === ingredientId))
        .filter(Boolean) as Ingredient[],
    [ingredients, selectedIngredientIds],
  );

  const filteredIngredients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedIngredientIdSet = new Set(selectedIngredientIds);

    return ingredients.filter((ingredient) => {
      if (selectedIngredientIdSet.has(ingredient.id)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        ingredient.name,
        ingredient.scientific_name ?? "",
        ingredient.ingredient_category ?? "",
        ingredient.slug,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [ingredients, query, selectedIngredientIds]);

  function addIngredient(ingredientId: string) {
    if (selectedIngredientIds.includes(ingredientId)) {
      return;
    }

    onChange([...selectedIngredientIds, ingredientId]);
    setQuery("");
    setIsOpen(true);
  }

  function removeIngredient(ingredientId: string) {
    onChange(selectedIngredientIds.filter((value) => value !== ingredientId));
  }

  return (
    <label className={`relative grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">Ingredients</span>
      <div className="rounded-[18px] border border-border-light bg-white p-3 transition focus-within:border-gold/80 focus-within:ring-4 focus-within:ring-gold/10">
        {selectedIngredients.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedIngredients.map((ingredient) => (
              <span
                key={ingredient.id}
                className="inline-flex items-center gap-2 rounded-pill bg-soft-green px-3 py-2 text-xs font-semibold text-primary"
              >
                <span>{ingredient.name}</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient.id)}
                  className="rounded-full text-primary/80 transition hover:text-primary"
                  aria-label={`Remove ${ingredient.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-sm text-muted">
            No ingredients selected yet. Search the live ingredient library and choose one or more items.
          </p>
        )}

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
          <input
            value={query}
            onBlur={() => {
              window.setTimeout(() => {
                setIsOpen(false);
                setQuery("");
              }, 120);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={isLoading ? "Loading ingredients..." : "Search and select ingredients"}
            className="min-h-12 w-full rounded-[14px] border border-border-light bg-white px-11 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80"
          />
        </div>

        {isOpen ? (
          <div className="mt-3 max-h-64 overflow-y-auto rounded-[18px] border border-border-light bg-white p-2 shadow-[0_20px_52px_rgba(15,23,42,0.12)]">
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted">
                <Loader2 className="size-4 animate-spin text-primary" />
                Loading ingredients...
              </div>
            ) : filteredIngredients.length ? (
              filteredIngredients.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addIngredient(ingredient.id)}
                  className="flex w-full items-start justify-between gap-3 rounded-[14px] px-3 py-3 text-left transition hover:bg-soft-green"
                >
                  <span>
                    <span className="block font-heading text-sm font-semibold text-text-dark">
                      {ingredient.name}
                    </span>
                    <span className="block text-xs text-muted">
                      {ingredient.ingredient_category || ingredient.scientific_name || ingredient.slug}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-primary">Add</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-muted">
                No ingredients found. Try another search term.
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted">
          {selectedIngredientIds.length} ingredient{selectedIngredientIds.length === 1 ? "" : "s"} selected from the live library.
        </span>
        {errorMessage ? <span className="font-semibold text-red-600">{errorMessage}</span> : null}
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-[18px] border border-border-light bg-white px-4 py-3 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}
