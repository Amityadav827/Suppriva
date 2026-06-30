"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MediaLibraryField } from "@/components/dashboard/media/MediaLibraryField";
import { ContentStatus } from "@/lib/database/constants";
import type {
  Author,
  Category,
  FAQItem,
  Ingredient,
  JsonValue,
  Product,
  Reviewer,
} from "@/lib/database/types";
import { motion } from "framer-motion";
import {
  Bold,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PRODUCT_LAYOUT_SECTION_DEFINITIONS,
  type ProductLayoutSectionKey,
} from "@/lib/product-layout";

type ProductLayoutFormItem = {
  section_key: ProductLayoutSectionKey;
  section_name: string;
  is_visible: boolean;
  sort_order: number;
  title_override: string;
  subtitle_override: string;
  background_style: "default";
  animation_enabled: boolean;
};

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
  product_layout_sections: ProductLayoutFormItem[];
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
  buying_guidance_content: string;
  buying_cta_label: string;
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
  sidebar_heading: string;
  sidebar_description: string;
  sidebar_facts: string;
  sidebar_cta_title: string;
  sidebar_cta_description: string;
  sidebar_cta_label: string;
  sidebar_cta_url: string;
  sidebar_cta_type: "affiliate" | "internal" | "external" | "ask_expert";
  sidebar_sticky_enabled: boolean;
  sidebar_trust_badges: string;
  toc_items: string;
  ingredient_overrides: string;
  status: ContentStatus;
  seo_title: string;
  seo_description: string;
  seo_canonical_url: string;
  seo_og_title: string;
  seo_og_description: string;
  seo_og_image: string;
  seo_noindex: boolean;
  seo_focus_keyword: string;
  seo_nofollow: boolean;
  seo_twitter_title: string;
  seo_twitter_description: string;
  seo_twitter_image: string;
  schema_brand: string;
  schema_sku: string;
  schema_mpn: string;
  schema_gtin: string;
  schema_price: string;
  schema_currency: string;
  schema_availability: string;
  schema_aggregate_rating: string;
  schema_review_count: string;
  schema_offer_url: string;
  schema_enable_product: boolean;
  schema_enable_faq: boolean;
  schema_enable_breadcrumb: boolean;
  schema_enable_review: boolean;
  schema_enable_organization: boolean;
  schema_json: string;
  product_image_title: string;
  product_image_alt: string;
  product_image_caption: string;
  product_image_description: string;
  product_image_credit: string;
  product_image_license: string;
  product_image_photographer: string;
  product_image_keywords: string;
  product_image_focus_keyword: string;
  product_image_source_url: string;
  product_image_enable_indexing: boolean;
  product_image_generate_filename: boolean;
  gallery_image_metadata: string;
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

type ExpertProfilesResponse = {
  authors?: Author[];
  reviewers?: Reviewer[];
  error?: string;
};

function createDefaultLayoutFormItems(): ProductLayoutFormItem[] {
  return PRODUCT_LAYOUT_SECTION_DEFINITIONS.map((section, index) => ({
    section_key: section.key,
    section_name: section.name,
    is_visible: true,
    sort_order: index,
    title_override: "",
    subtitle_override: "",
    background_style: "default",
    animation_enabled: true,
  }));
}

function normalizeLayoutFormItems(items: ProductLayoutFormItem[]) {
  return [...items]
    .sort((first, second) => first.sort_order - second.sort_order)
    .map((item, index) => ({ ...item, sort_order: index }));
}

function productLayoutToForm(
  items?: Product["product_layout_sections"],
): ProductLayoutFormItem[] {
  const savedItemsByKey = new Map((items ?? []).map((item) => [item.section_key, item]));

  return createDefaultLayoutFormItems().map((item) => {
    const savedItem = savedItemsByKey.get(item.section_key);

    if (!savedItem) {
      return item;
    }

    return {
      ...item,
      is_visible: savedItem.is_visible,
      sort_order: savedItem.sort_order,
      title_override: savedItem.title_override ?? "",
      subtitle_override: savedItem.subtitle_override ?? "",
      background_style: savedItem.background_style ?? "default",
      animation_enabled: savedItem.animation_enabled,
    };
  }).sort((first, second) => first.sort_order - second.sort_order);
}

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
  product_layout_sections: createDefaultLayoutFormItems(),
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
  buying_guidance_content: "",
  buying_cta_label: "",
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
  sidebar_heading: "",
  sidebar_description: "",
  sidebar_facts: "",
  sidebar_cta_title: "",
  sidebar_cta_description: "",
  sidebar_cta_label: "",
  sidebar_cta_url: "",
  sidebar_cta_type: "affiliate",
  sidebar_sticky_enabled: true,
  sidebar_trust_badges: "",
  toc_items: "",
  ingredient_overrides: "",
  status: ContentStatus.Draft,
  seo_title: "",
  seo_description: "",
  seo_canonical_url: "",
  seo_og_title: "",
  seo_og_description: "",
  seo_og_image: "",
  seo_noindex: false,
  seo_focus_keyword: "",
  seo_nofollow: false,
  seo_twitter_title: "",
  seo_twitter_description: "",
  seo_twitter_image: "",
  schema_brand: "",
  schema_sku: "",
  schema_mpn: "",
  schema_gtin: "",
  schema_price: "",
  schema_currency: "USD",
  schema_availability: "",
  schema_aggregate_rating: "",
  schema_review_count: "",
  schema_offer_url: "",
  schema_enable_product: true,
  schema_enable_faq: true,
  schema_enable_breadcrumb: true,
  schema_enable_review: true,
  schema_enable_organization: true,
  schema_json: "",
  product_image_title: "",
  product_image_alt: "",
  product_image_caption: "",
  product_image_description: "",
  product_image_credit: "",
  product_image_license: "",
  product_image_photographer: "",
  product_image_keywords: "",
  product_image_focus_keyword: "",
  product_image_source_url: "",
  product_image_enable_indexing: true,
  product_image_generate_filename: false,
  gallery_image_metadata: "",
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

function serializeCmsCardsAsRichText(
  items?: Array<{
    title?: string | null;
    description?: string | null;
  }>,
) {
  return (items ?? [])
    .map((item) =>
      [item.title ? `**${item.title.trim()}**` : "", item.description?.trim() ?? ""]
        .filter(Boolean)
        .join("\n"),
    )
    .filter(Boolean)
    .join("\n\n");
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
    is_active?: boolean;
  }>,
) {
  return (items ?? [])
    .map((item) =>
      [
        item.label ?? "",
        item.value ?? "",
        item.icon ?? "",
        item.is_active === false ? "hidden" : "",
      ]
        .map((part) => part.trim())
        .join(" | ")
        .replace(/(?:\s\|\s)*$/g, ""),
    )
    .filter(Boolean)
    .join("\n");
}

function parseSidebarFacts(value: string) {
  return lines(value).map((item, index) => {
    const [label, factValue = "", icon = "", status = ""] = item.split("|").map((part) => part.trim());
    const isActive = !["hidden", "inactive", "false", "0"].includes(status.toLowerCase());

    return {
      label,
      value: factValue,
      icon: icon || null,
      display_order: index,
      is_active: isActive,
    };
  });
}

function serializeSidebarTrustBadges(
  items?: Array<{
    title?: string | null;
    description?: string | null;
    icon?: string | null;
    is_active?: boolean;
  }>,
) {
  return (items ?? [])
    .map((item) =>
      [
        item.title ?? "",
        item.description ?? "",
        item.icon ?? "",
        item.is_active === false ? "hidden" : "",
      ]
        .map((part) => part.trim())
        .join(" | ")
        .replace(/(?:\s\|\s)*$/g, ""),
    )
    .filter(Boolean)
    .join("\n");
}

function parseSidebarTrustBadges(value: string) {
  return lines(value).map((item, index) => {
    const [title, description = "", icon = "", status = ""] = item
      .split("|")
      .map((part) => part.trim());
    const isActive = !["hidden", "inactive", "false", "0"].includes(status.toLowerCase());

    return {
      title,
      description: description || null,
      icon: icon || null,
      display_order: index,
      is_active: isActive,
    };
  });
}

function serializeTocItems(
  items?: Array<{
    label?: string | null;
    anchor_id?: string | null;
    icon?: string | null;
    is_visible?: boolean;
    is_active?: boolean;
  }>,
) {
  return (items ?? [])
    .map((item) =>
      [
        item.label ?? "",
        item.anchor_id ?? "",
        item.icon ?? "",
        item.is_visible === false || item.is_active === false ? "hidden" : "",
      ]
        .map((part) => part.trim())
        .join(" | ")
        .replace(/(?:\s\|\s)*$/g, ""),
    )
    .filter(Boolean)
    .join("\n");
}

function parseTocItems(value: string) {
  return lines(value).map((item, index) => {
    const [label, anchorId = "", icon = "", status = ""] = item
      .split("|")
      .map((part) => part.trim());
    const isVisible = !["hidden", "inactive", "false", "0"].includes(status.toLowerCase());

    return {
      label,
      anchor_id: anchorId,
      icon: icon || null,
      display_order: index,
      is_visible: isVisible,
      is_active: isVisible,
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

function safeMetadataRecord(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function metadataString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function metadataBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function metadataKeywords(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").join("\n")
    : "";
}

function serializeGalleryImageMetadata(items?: Product["gallery_image_metadata"]) {
  return safeArray(items)
    .map((item) => {
      const metadata = safeMetadataRecord(item);
      return [
        metadataString(metadata.url),
        metadataString(metadata.alt),
        metadataString(metadata.title),
        metadataString(metadata.caption),
        metadataString(metadata.description),
      ]
        .map((part) => part.trim())
        .join(" | ")
        .replace(/(?:\s\|\s)*$/g, "");
    })
    .filter(Boolean)
    .join("\n");
}

function parseGalleryImageMetadata(value: string) {
  return lines(value)
    .map((item) => {
      const [url = "", alt = "", title = "", caption = "", description = ""] = item
        .split("|")
        .map((part) => part.trim());

      return {
        url,
        alt: alt || null,
        title: title || null,
        caption: caption || null,
        description: description || null,
      };
    })
    .filter((item) => item.url);
}

function getSeoPreviewUrl(form: ProductFormState) {
  if (form.seo_canonical_url) {
    return form.seo_canonical_url;
  }

  const slug = form.slug || "product-slug";
  return `https://suppriva.vercel.app/product/${slug}`;
}

function productToForm(product: Product): ProductFormState {
  const heroChecklist = safeStringArray(product.hero_checklist);
  const gallery = safeStringArray(product.gallery);
  const benefits = safeJsonArray(product.benefits);
  const pros = safeStringArray(product.pros);
  const cons = safeStringArray(product.cons);
  const faq = safeArray(product.faq);
  const ingredientIds = safeStringArray(product.ingredient_ids);
  const imageMetadata = safeMetadataRecord(product.product_image_metadata);

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
    product_layout_sections: productLayoutToForm(product.product_layout_sections),
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
    buying_guidance_content:
      product.buying_guidance_content ?? serializeCmsCardsAsRichText(product.buying_guide_items),
    buying_cta_label: product.buying_cta_label ?? "",
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
    sidebar_heading: product.sidebar_heading ?? "",
    sidebar_description: product.sidebar_description ?? "",
    sidebar_facts: serializeSidebarFacts(product.sidebar_facts),
    sidebar_cta_title: product.sidebar_cta_title ?? "",
    sidebar_cta_description: product.sidebar_cta_description ?? "",
    sidebar_cta_label: product.sidebar_cta_label ?? "",
    sidebar_cta_url: product.sidebar_cta_url ?? "",
    sidebar_cta_type: product.sidebar_cta_type ?? "affiliate",
    sidebar_sticky_enabled: product.sidebar_sticky_enabled ?? true,
    sidebar_trust_badges: serializeSidebarTrustBadges(product.sidebar_trust_badges),
    toc_items: serializeTocItems(product.toc_items),
    ingredient_overrides: serializeIngredientOverrides(product.ingredient_overrides),
    status: product.status,
    seo_title: product.seo_title ?? "",
    seo_description: product.seo_description ?? "",
    seo_canonical_url: product.seo_canonical_url ?? "",
    seo_og_title: product.seo_og_title ?? "",
    seo_og_description: product.seo_og_description ?? "",
    seo_og_image: product.seo_og_image ?? "",
    seo_noindex: product.seo_noindex ?? false,
    seo_focus_keyword: product.seo_focus_keyword ?? "",
    seo_nofollow: product.seo_nofollow ?? false,
    seo_twitter_title: product.seo_twitter_title ?? "",
    seo_twitter_description: product.seo_twitter_description ?? "",
    seo_twitter_image: product.seo_twitter_image ?? "",
    schema_brand: product.schema_brand ?? "",
    schema_sku: product.schema_sku ?? "",
    schema_mpn: product.schema_mpn ?? "",
    schema_gtin: product.schema_gtin ?? "",
    schema_price: product.schema_price?.toString() ?? "",
    schema_currency: product.schema_currency ?? "USD",
    schema_availability: product.schema_availability ?? "",
    schema_aggregate_rating: product.schema_aggregate_rating?.toString() ?? "",
    schema_review_count: product.schema_review_count?.toString() ?? "",
    schema_offer_url: product.schema_offer_url ?? "",
    schema_enable_product: product.schema_enable_product ?? true,
    schema_enable_faq: product.schema_enable_faq ?? true,
    schema_enable_breadcrumb: product.schema_enable_breadcrumb ?? true,
    schema_enable_review: product.schema_enable_review ?? true,
    schema_enable_organization: product.schema_enable_organization ?? true,
    schema_json:
      product.schema_json && typeof product.schema_json === "object"
        ? JSON.stringify(product.schema_json, null, 2)
        : "",
    product_image_title: metadataString(imageMetadata.title),
    product_image_alt: metadataString(imageMetadata.alt) || product.hero_image_alt || "",
    product_image_caption: metadataString(imageMetadata.caption),
    product_image_description: metadataString(imageMetadata.description),
    product_image_credit: metadataString(imageMetadata.credit),
    product_image_license: metadataString(imageMetadata.license),
    product_image_photographer: metadataString(imageMetadata.photographer),
    product_image_keywords: metadataKeywords(imageMetadata.keywords),
    product_image_focus_keyword: metadataString(imageMetadata.focus_keyword),
    product_image_source_url: metadataString(imageMetadata.source_url),
    product_image_enable_indexing: metadataBoolean(imageMetadata.enable_indexing, true),
    product_image_generate_filename: metadataBoolean(imageMetadata.generate_filename, false),
    gallery_image_metadata: serializeGalleryImageMetadata(product.gallery_image_metadata),
  };
}

function formToPayload(form: ProductFormState) {
  const gallery = safeStringArray(form.gallery);
  const ingredientIds = safeStringArray(form.ingredient_ids);

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
    product_layout_sections: normalizeLayoutFormItems(form.product_layout_sections).map(
      (item) => ({
        section_key: item.section_key,
        is_visible: item.is_visible,
        sort_order: item.sort_order,
        title_override: item.title_override || null,
        subtitle_override: item.subtitle_override || null,
        background_style: item.background_style,
        animation_enabled: item.animation_enabled,
      }),
    ),
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
    buying_guidance_content: form.buying_guidance_content || null,
    buying_cta_label: form.buying_cta_label || null,
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
    sidebar_heading: form.sidebar_heading || null,
    sidebar_description: form.sidebar_description || null,
    sidebar_facts: parseSidebarFacts(form.sidebar_facts),
    sidebar_cta_title: form.sidebar_cta_title || null,
    sidebar_cta_description: form.sidebar_cta_description || null,
    sidebar_cta_label: form.sidebar_cta_label || null,
    sidebar_cta_url: form.sidebar_cta_url || null,
    sidebar_cta_type: form.sidebar_cta_type,
    sidebar_sticky_enabled: form.sidebar_sticky_enabled,
    sidebar_trust_badges: parseSidebarTrustBadges(form.sidebar_trust_badges),
    toc_items: parseTocItems(form.toc_items),
    ingredient_overrides: parseIngredientOverrides(form.ingredient_overrides),
    status: form.status,
    seo_title: form.seo_title || null,
    seo_description: form.seo_description || null,
    seo_canonical_url: form.seo_canonical_url || null,
    seo_og_title: form.seo_og_title || null,
    seo_og_description: form.seo_og_description || null,
    seo_og_image: form.seo_og_image || null,
    seo_noindex: form.seo_noindex,
    seo_focus_keyword: form.seo_focus_keyword || null,
    seo_nofollow: form.seo_nofollow,
    seo_twitter_title: form.seo_twitter_title || null,
    seo_twitter_description: form.seo_twitter_description || null,
    seo_twitter_image: form.seo_twitter_image || null,
    schema_brand: form.schema_brand || null,
    schema_sku: form.schema_sku || null,
    schema_mpn: form.schema_mpn || null,
    schema_gtin: form.schema_gtin || null,
    schema_price: form.schema_price ? Number(form.schema_price) : null,
    schema_currency: form.schema_currency || null,
    schema_availability: form.schema_availability || null,
    schema_aggregate_rating: form.schema_aggregate_rating
      ? Number(form.schema_aggregate_rating)
      : null,
    schema_review_count: form.schema_review_count ? Number(form.schema_review_count) : null,
    schema_offer_url: form.schema_offer_url || null,
    schema_enable_product: form.schema_enable_product,
    schema_enable_faq: form.schema_enable_faq,
    schema_enable_breadcrumb: form.schema_enable_breadcrumb,
    schema_enable_review: form.schema_enable_review,
    schema_enable_organization: form.schema_enable_organization,
    schema_json: parseSchemaJson(form.schema_json),
    product_image_metadata: {
      url: form.image || null,
      title: form.product_image_title || null,
      alt: form.product_image_alt || form.hero_image_alt || null,
      caption: form.product_image_caption || null,
      description: form.product_image_description || null,
      credit: form.product_image_credit || null,
      license: form.product_image_license || null,
      photographer: form.product_image_photographer || null,
      keywords: lines(form.product_image_keywords),
      focus_keyword: form.product_image_focus_keyword || null,
      source_url: form.product_image_source_url || null,
      enable_indexing: form.product_image_enable_indexing,
      generate_filename: form.product_image_generate_filename,
    },
    gallery_image_metadata: parseGalleryImageMetadata(form.gallery_image_metadata),
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
  const [authors, setAuthors] = useState<Author[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isIngredientsLoading, setIsIngredientsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageMetadataOpen, setIsImageMetadataOpen] = useState(false);
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
    void fetchExpertProfiles();
  }, [fetchCategories, fetchExpertProfiles, fetchIngredients, fetchProducts]);

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
    setIsImageMetadataOpen(false);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setForm(productToForm(product));
    setIsImageMetadataOpen(false);
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
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => setIsImageMetadataOpen((current) => !current)}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
              >
                <Pencil className="size-4" />
                {isImageMetadataOpen ? "Hide Metadata" : "Edit Metadata"}
              </button>
            </div>
            {isImageMetadataOpen ? (
              <div className="grid gap-4 rounded-[24px] border border-border-light bg-cream/40 p-4 lg:col-span-2 lg:grid-cols-2">
                <InputField label="Image Title" value={form.product_image_title} onChange={(value) => updateForm("product_image_title", value)} />
                <InputField label="Alt Text" value={form.product_image_alt} onChange={(value) => updateForm("product_image_alt", value)} />
                <InputField label="Caption" value={form.product_image_caption} onChange={(value) => updateForm("product_image_caption", value)} />
                <div className="grid gap-3">
                  <CheckboxField label="Enable Image Indexing" checked={form.product_image_enable_indexing} onChange={(value) => updateForm("product_image_enable_indexing", value)} />
                </div>
              </div>
            ) : null}
            <InputField label="Affiliate URL" value={form.affiliate_url} onChange={(value) => updateForm("affiliate_url", value)} />
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
            <RichTextEditor label="Short Description" value={form.short_description} onChange={(value) => updateForm("short_description", value)} />
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
              <RichTextEditor label="Hero Description" value={form.hero_description} onChange={(value) => updateForm("hero_description", value)} className="lg:col-span-2" rows={4} />
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
              <RichTextEditor label="Overview Content" value={form.overview_content} onChange={(value) => updateForm("overview_content", value)} className="lg:col-span-2" rows={5} />
              <InputField label="How It Works Title" value={form.how_it_works_title} onChange={(value) => updateForm("how_it_works_title", value)} />
              <InputField label="How It Works Subtitle" value={form.how_it_works_subtitle} onChange={(value) => updateForm("how_it_works_subtitle", value)} />
              <RichTextEditor label="How It Works Content" value={form.how_it_works_content} onChange={(value) => updateForm("how_it_works_content", value)} rows={4} />
              <TextAreaField label="How It Works Steps" value={form.how_it_works_steps} onChange={(value) => updateForm("how_it_works_steps", value)} placeholder="Title | Description | icon, one per line" rows={4} />
            </CmsSection>

            <CmsSection title="Content Sections">
              <InputField label="Best For Title" value={form.best_for_title} onChange={(value) => updateForm("best_for_title", value)} />
              <InputField label="Best For Subtitle" value={form.best_for_subtitle} onChange={(value) => updateForm("best_for_subtitle", value)} />
              <TextAreaField label="Best For Cards" value={form.best_for_items} onChange={(value) => updateForm("best_for_items", value)} placeholder="Title | Description | icon, one per line" rows={4} />
            </CmsSection>

            <CmsSection title="Safety Information">
              <InputField label="Safety Title" value={form.safety_title} onChange={(value) => updateForm("safety_title", value)} />
              <InputField label="Safety Subtitle" value={form.safety_subtitle} onChange={(value) => updateForm("safety_subtitle", value)} />
              <TextAreaField
                label="Safety Items"
                value={form.safety_items}
                onChange={(value) => updateForm("safety_items", value)}
                placeholder="precaution | Dietary Supplement | Full safety description | shield-check"
                helperText="One item per line. Format: type | title | description | icon. Types: precaution, side_effect, who_should_avoid, interaction."
                className="lg:col-span-2"
                rows={5}
              />
              <InputField label="Verdict Title" value={form.verdict_title} onChange={(value) => updateForm("verdict_title", value)} />
              <InputField label="Verdict Subtitle" value={form.verdict_subtitle} onChange={(value) => updateForm("verdict_subtitle", value)} />
              <RichTextEditor label="Verdict Summary" value={form.verdict_summary} onChange={(value) => updateForm("verdict_summary", value)} rows={4} />
              <RichTextEditor label="Verdict Recommendation" value={form.verdict_recommendation} onChange={(value) => updateForm("verdict_recommendation", value)} rows={4} />
              <RichTextEditor label="Verdict Best For" value={form.verdict_best_for} onChange={(value) => updateForm("verdict_best_for", value)} rows={2} />
              <RichTextEditor label="Verdict Not Ideal For" value={form.verdict_not_ideal_for} onChange={(value) => updateForm("verdict_not_ideal_for", value)} rows={2} />
              <RichTextEditor label="Verdict Conclusion" value={form.verdict_conclusion} onChange={(value) => updateForm("verdict_conclusion", value)} className="lg:col-span-2" rows={3} />
            </CmsSection>

            <CmsSection
              title="Where To Buy"
              description="Edit the product purchase guidance section shown below Pros & Cons on the product page."
            >
              <InputField label="Where To Buy Title" value={form.buying_guide_title} onChange={(value) => updateForm("buying_guide_title", value)} />
              <InputField label="Where To Buy Subtitle" value={form.buying_guide_subtitle} onChange={(value) => updateForm("buying_guide_subtitle", value)} />
              <InputField label="Button Label" value={form.buying_cta_label} onChange={(value) => updateForm("buying_cta_label", value)} />
              <RichTextEditor
                label="Purchase Guidance Content"
                value={form.buying_guidance_content}
                onChange={(value) => updateForm("buying_guidance_content", value)}
                placeholder={`Buy from the Official Website

Purchase directly from the official website to help ensure you receive an authentic product and the latest available offers.`}
                helperText="Rich content shown in the Where To Buy section. Use paragraphs, lists, and links as needed."
                className="lg:col-span-2"
                rows={8}
              />
            </CmsSection>

            <CmsSection title="Sidebar & Navigation">
              <TextAreaField label="Table of Contents Items" value={form.toc_items} onChange={(value) => updateForm("toc_items", value)} placeholder="Section name | anchor-id | icon | hidden" rows={4} />
              <RichTextEditor label="Sidebar Heading" value={form.sidebar_heading} onChange={(value) => updateForm("sidebar_heading", value)} rows={2} />
              <RichTextEditor label="Sidebar Description" value={form.sidebar_description} onChange={(value) => updateForm("sidebar_description", value)} />
              <CheckboxField label="Enable sticky desktop sidebar" checked={form.sidebar_sticky_enabled} onChange={(value) => updateForm("sidebar_sticky_enabled", value)} />
              <TextAreaField label="Sidebar Facts" value={form.sidebar_facts} onChange={(value) => updateForm("sidebar_facts", value)} placeholder="Label | Value | icon | hidden" rows={4} />
              <TextAreaField label="Sidebar Trust Badges" value={form.sidebar_trust_badges} onChange={(value) => updateForm("sidebar_trust_badges", value)} placeholder="Title | Description | icon | hidden" rows={4} />
            </CmsSection>

            <CmsSection title="Related Content">
              <InputField label="Related Ingredients Title" value={form.related_ingredients_title} onChange={(value) => updateForm("related_ingredients_title", value)} />
              <InputField label="Related Ingredients Subtitle" value={form.related_ingredients_subtitle} onChange={(value) => updateForm("related_ingredients_subtitle", value)} />
              <InputField label="Compare Title" value={form.compare_title} onChange={(value) => updateForm("compare_title", value)} />
              <InputField label="Compare Subtitle" value={form.compare_subtitle} onChange={(value) => updateForm("compare_subtitle", value)} />
              <InputField label="Related Products Title" value={form.related_products_title} onChange={(value) => updateForm("related_products_title", value)} />
              <InputField label="Related Products Subtitle" value={form.related_products_subtitle} onChange={(value) => updateForm("related_products_subtitle", value)} />
              <InputField label="Health Needs Title" value={form.health_needs_title} onChange={(value) => updateForm("health_needs_title", value)} />
              <InputField label="Health Needs Subtitle" value={form.health_needs_subtitle} onChange={(value) => updateForm("health_needs_subtitle", value)} />
            </CmsSection>

            <CmsSection
              title="Advanced SEO"
              description="Control product metadata, social previews, and SEO settings from the dashboard."
            >
              <InputField label="SEO Title" value={form.seo_title} onChange={(value) => updateForm("seo_title", value)} />
              <InputField label="Focus Keyword" value={form.seo_focus_keyword} onChange={(value) => updateForm("seo_focus_keyword", value)} />
              <TextAreaField label="SEO Description" value={form.seo_description} onChange={(value) => updateForm("seo_description", value)} rows={3} />
              <InputField label="Canonical URL Override" value={form.seo_canonical_url} onChange={(value) => updateForm("seo_canonical_url", value)} />
              <div className="grid gap-3">
                <CheckboxField label="No Index" checked={form.seo_noindex} onChange={(value) => updateForm("seo_noindex", value)} />
                <CheckboxField label="No Follow" checked={form.seo_nofollow} onChange={(value) => updateForm("seo_nofollow", value)} />
              </div>

              <div className="grid gap-4 rounded-[22px] border border-border-light bg-white p-4 lg:col-span-2 lg:grid-cols-2">
                <h4 className="font-heading text-sm font-extrabold uppercase tracking-[0.18em] text-primary lg:col-span-2">
                  Open Graph
                </h4>
                <InputField label="OG Title" value={form.seo_og_title} onChange={(value) => updateForm("seo_og_title", value)} />
                <InputField label="OG Description" value={form.seo_og_description} onChange={(value) => updateForm("seo_og_description", value)} />
                <MediaLibraryField label="OG Image" value={form.seo_og_image} onChange={(value) => updateForm("seo_og_image", value)} className="lg:col-span-2" />
              </div>

              <div className="grid gap-4 rounded-[22px] border border-border-light bg-white p-4 lg:col-span-2 lg:grid-cols-2">
                <h4 className="font-heading text-sm font-extrabold uppercase tracking-[0.18em] text-primary lg:col-span-2">
                  Twitter
                </h4>
                <InputField label="Twitter Title" value={form.seo_twitter_title} onChange={(value) => updateForm("seo_twitter_title", value)} />
                <InputField label="Twitter Description" value={form.seo_twitter_description} onChange={(value) => updateForm("seo_twitter_description", value)} />
                <MediaLibraryField label="Twitter Image" value={form.seo_twitter_image} onChange={(value) => updateForm("seo_twitter_image", value)} className="lg:col-span-2" />
              </div>

              <SeoPreviewPanel form={form} />
              <SocialPreviewPanel form={form} />
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

function SeoPreviewPanel({ form }: { form: ProductFormState }) {
  const title = form.seo_title || form.title || "SEO title preview";
  const description =
    form.seo_description || form.short_description || "SEO description preview will appear here.";

  return (
    <div className="grid gap-3 rounded-[22px] border border-border-light bg-white p-4 lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-heading text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
          Google Preview
        </h4>
        <span className="text-xs font-semibold text-muted">{title.length}/60</span>
      </div>
      <div className="rounded-[18px] border border-border-light bg-white p-4">
        <p className="text-xs text-emerald-700">{getSeoPreviewUrl(form)}</p>
        <p className="mt-1 text-lg font-medium text-blue-700">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}

function SocialPreviewPanel({ form }: { form: ProductFormState }) {
  const title = form.seo_og_title || form.seo_title || form.title || "Social preview title";
  const description =
    form.seo_og_description ||
    form.seo_description ||
    form.short_description ||
    "Social preview description.";
  const image = form.seo_og_image || form.seo_twitter_image || form.image;

  return (
    <div className="grid gap-3 rounded-[22px] border border-border-light bg-white p-4 lg:col-span-2">
      <h4 className="font-heading text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
        Social Preview
      </h4>
      <div className="overflow-hidden rounded-[18px] border border-border-light">
        <div
          className="aspect-[1.91/1] bg-cream bg-cover bg-center"
          style={image ? { backgroundImage: `url(${image})` } : undefined}
        >
          {!image ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No social image selected
            </div>
          ) : null}
        </div>
        <div className="grid gap-1 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">suppriva.vercel.app</p>
          <p className="font-heading text-base font-extrabold text-text-dark">{title}</p>
          <p className="text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
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

function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  rows = 4,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  rows?: number;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function insertMarkup(prefix: string, suffix = prefix, fallback = "text") {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || fallback;
    const nextValue = `${value.slice(0, start)}${prefix}${selectedText}${suffix}${value.slice(end)}`;

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    });
  }

  function insertBulletList() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || "List item";
    const listText = selectedText
      .split("\n")
      .map((line) => `- ${line.replace(/^[-*]\s*/, "")}`)
      .join("\n");
    const nextValue = `${value.slice(0, start)}${listText}${value.slice(end)}`;

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start, start + listText.length);
    });
  }

  function insertNumberedList() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || "List item";
    const listText = selectedText
      .split("\n")
      .map((line, index) => `${index + 1}. ${line.replace(/^\d+\.\s*/, "")}`)
      .join("\n");
    const nextValue = `${value.slice(0, start)}${listText}${value.slice(end)}`;

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start, start + listText.length);
    });
  }

  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <div className="overflow-hidden rounded-[18px] border border-border-light bg-white focus-within:border-gold/80 focus-within:ring-4 focus-within:ring-gold/10">
        <div className="flex flex-wrap gap-2 border-b border-border-light bg-cream/50 px-3 py-2">
          <EditorButton label="Bold" onClick={() => insertMarkup("**", "**", "bold text")}>
            <Bold className="size-4" />
          </EditorButton>
          <EditorButton label="Italic" onClick={() => insertMarkup("*", "*", "italic text")}>
            <Italic className="size-4" />
          </EditorButton>
          <EditorButton label="Heading" onClick={() => insertMarkup("## ", "", "Heading")}>
            <Heading2 className="size-4" />
          </EditorButton>
          <EditorButton label="Bullet list" onClick={insertBulletList}>
            <List className="size-4" />
          </EditorButton>
          <EditorButton label="Numbered list" onClick={insertNumberedList}>
            <ListOrdered className="size-4" />
          </EditorButton>
          <EditorButton label="Link" onClick={() => insertMarkup("[", "](https://example.com)", "link text")}>
            <LinkIcon className="size-4" />
          </EditorButton>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y border-0 bg-white px-4 py-3 text-sm text-text-dark outline-none placeholder:text-muted/70"
        />
      </div>
      {helperText ? <span className="text-xs text-muted">{helperText}</span> : null}
    </label>
  );
}

function EditorButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border-light bg-white text-primary transition hover:border-gold/70 hover:bg-soft-green"
    >
      {children}
    </button>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  rows = 3,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
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
      {helperText ? <span className="text-xs text-muted">{helperText}</span> : null}
    </label>
  );
}
