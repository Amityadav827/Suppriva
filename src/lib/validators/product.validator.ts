import { ContentStatus } from "@/lib/database/constants";
import type {
  FAQItem,
  JsonValue,
  Product,
  ProductCmsCard,
  ProductCompareProduct,
  ProductHowItWorksStep,
  ProductImageMetadata,
  ProductIngredient,
  ProductIngredientOverride,
  ProductRelatedBlog,
  ProductRelatedIngredient,
  ProductRelatedProduct,
  ProductSafetyItem,
  ProductSafetyItemType,
  ProductSidebarFact,
  ProductSidebarTrustBadge,
  ProductTocItem,
  ProductLayoutSection,
} from "@/lib/database/types";
import {
  PRODUCT_LAYOUT_SECTION_KEYS,
  type ProductLayoutSectionKey,
} from "@/lib/product-layout";

export type ProductCmsCardInput = Pick<
  ProductCmsCard,
  "title" | "description" | "icon" | "display_order" | "is_active"
>;

export type ProductHowItWorksStepInput = Pick<
  ProductHowItWorksStep,
  "title" | "description" | "icon" | "display_order" | "is_active"
>;

export type ProductSafetyItemInput = Pick<
  ProductSafetyItem,
  "item_type" | "title" | "description" | "icon" | "display_order" | "is_active"
>;

export type ProductSidebarFactInput = Pick<
  ProductSidebarFact,
  "label" | "value" | "icon" | "display_order" | "is_active"
>;

export type ProductSidebarTrustBadgeInput = Pick<
  ProductSidebarTrustBadge,
  "title" | "description" | "icon" | "display_order" | "is_active"
>;

export type ProductTocItemInput = Pick<
  ProductTocItem,
  "label" | "anchor_id" | "icon" | "display_order" | "is_visible" | "is_active"
>;

export type ProductLayoutSectionInput = Pick<
  ProductLayoutSection,
  | "section_key"
  | "is_visible"
  | "sort_order"
  | "title_override"
  | "subtitle_override"
  | "background_style"
  | "animation_enabled"
>;

export type ProductIngredientOverrideInput = Pick<
  ProductIngredientOverride,
  | "ingredient_id"
  | "display_order"
  | "purpose"
  | "dosage"
  | "description_override"
  | "custom_note"
  | "is_highlighted"
>;

export type ProductImageMetadataInput = ProductImageMetadata;

export type ProductRelatedProductInput = Pick<
  ProductRelatedProduct,
  | "related_product_id"
  | "display_order"
  | "relationship_type"
  | "title_override"
  | "description_override"
  | "is_active"
>;

export type ProductCompareProductInput = Pick<
  ProductCompareProduct,
  "compared_product_id" | "display_order" | "title_override" | "description_override" | "is_active"
>;

export type ProductRelatedBlogInput = Pick<
  ProductRelatedBlog,
  "blog_id" | "display_order" | "title_override" | "description_override" | "is_active"
>;

export type ProductRelatedIngredientInput = Pick<
  ProductRelatedIngredient,
  "ingredient_id" | "display_order" | "title_override" | "description_override" | "is_active"
>;

export type ProductCreateInput = {
  category_id?: string | null;
  ingredient_ids?: string[];
  author_id?: string | null;
  reviewer_id?: string | null;
  title: string;
  slug?: string;
  hero_badge?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_description?: string | null;
  hero_image_alt?: string | null;
  hero_cta_label?: string | null;
  hero_cta_target?: "_self" | "_blank" | null;
  hero_secondary_cta_label?: string | null;
  hero_secondary_cta_target?: "_self" | "_blank" | null;
  hero_checklist?: string[];
  hero_show_rating?: boolean;
  hero_show_rating_label?: boolean;
  hero_show_review_count?: boolean;
  hero_show_badge?: boolean;
  review_count?: number | null;
  rating_label?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  image?: string | null;
  gallery?: string[];
  rating?: number | null;
  affiliate_url?: string | null;
  ingredients?: ProductIngredient[];
  benefits?: JsonValue[];
  pros?: string[];
  cons?: string[];
  faq?: FAQItem[];
  status?: ContentStatus;
  published_at?: string | null;
  overview_title?: string | null;
  overview_subtitle?: string | null;
  overview_content?: string | null;
  how_it_works_title?: string | null;
  how_it_works_subtitle?: string | null;
  how_it_works_content?: string | null;
  benefits_title?: string | null;
  benefits_subtitle?: string | null;
  ingredients_title?: string | null;
  ingredients_subtitle?: string | null;
  best_for_title?: string | null;
  best_for_subtitle?: string | null;
  safety_title?: string | null;
  safety_subtitle?: string | null;
  pros_cons_title?: string | null;
  pros_cons_subtitle?: string | null;
  faq_title?: string | null;
  faq_subtitle?: string | null;
  verdict_title?: string | null;
  verdict_subtitle?: string | null;
  verdict_summary?: string | null;
  verdict_best_for?: string | null;
  verdict_not_ideal_for?: string | null;
  verdict_recommendation?: string | null;
  verdict_conclusion?: string | null;
  buying_guide_title?: string | null;
  buying_guide_subtitle?: string | null;
  buying_guidance_content?: string | null;
  buying_cta_label?: string | null;
  related_ingredients_title?: string | null;
  related_ingredients_subtitle?: string | null;
  related_blogs_title?: string | null;
  related_blogs_subtitle?: string | null;
  compare_title?: string | null;
  compare_subtitle?: string | null;
  related_products_title?: string | null;
  related_products_subtitle?: string | null;
  health_needs_title?: string | null;
  health_needs_subtitle?: string | null;
  sidebar_heading?: string | null;
  sidebar_description?: string | null;
  sidebar_cta_title?: string | null;
  sidebar_cta_description?: string | null;
  sidebar_cta_label?: string | null;
  sidebar_cta_url?: string | null;
  sidebar_cta_type?: "affiliate" | "internal" | "external" | "ask_expert" | null;
  sidebar_sticky_enabled?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_canonical_url?: string | null;
  seo_og_title?: string | null;
  seo_og_description?: string | null;
  seo_og_image?: string | null;
  seo_noindex?: boolean;
  seo_focus_keyword?: string | null;
  seo_nofollow?: boolean;
  seo_twitter_title?: string | null;
  seo_twitter_description?: string | null;
  seo_twitter_image?: string | null;
  schema_brand?: string | null;
  schema_sku?: string | null;
  schema_mpn?: string | null;
  schema_gtin?: string | null;
  schema_price?: number | null;
  schema_currency?: string | null;
  schema_availability?: string | null;
  schema_aggregate_rating?: number | null;
  schema_review_count?: number | null;
  schema_offer_url?: string | null;
  schema_enable_product?: boolean;
  schema_enable_faq?: boolean;
  schema_enable_breadcrumb?: boolean;
  schema_enable_review?: boolean;
  schema_enable_organization?: boolean;
  schema_json?: JsonValue;
  product_image_metadata?: ProductImageMetadataInput;
  gallery_image_metadata?: ProductImageMetadataInput[];
  standout_points?: ProductCmsCardInput[];
  how_it_works_steps?: ProductHowItWorksStepInput[];
  best_for_items?: ProductCmsCardInput[];
  safety_items?: ProductSafetyItemInput[];
  buying_guide_items?: ProductCmsCardInput[];
  sidebar_facts?: ProductSidebarFactInput[];
  sidebar_trust_badges?: ProductSidebarTrustBadgeInput[];
  toc_items?: ProductTocItemInput[];
  product_layout_sections?: ProductLayoutSectionInput[];
  ingredient_overrides?: ProductIngredientOverrideInput[];
  related_product_relations?: ProductRelatedProductInput[];
  compare_product_relations?: ProductCompareProductInput[];
  related_blog_relations?: ProductRelatedBlogInput[];
  related_ingredient_relations?: ProductRelatedIngredientInput[];
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

export type ProductValidationInput = ProductCreateInput | ProductUpdateInput;

export type ProductValidationResult<TInput extends ProductValidationInput> = {
  success: boolean;
  data: TInput;
  errors: string[];
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isFaqArray(value: unknown): value is FAQItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "question" in item &&
        "answer" in item &&
        typeof item.question === "string" &&
        typeof item.answer === "string" &&
        (item.display_order === undefined || typeof item.display_order === "number") &&
        (item.is_visible === undefined || typeof item.is_visible === "boolean"),
    )
  );
}

function isIngredientArray(value: unknown): value is ProductIngredient[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "name" in item &&
        typeof item.name === "string",
    )
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === "boolean";
}

function isUrlLike(value: string) {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isProductImageMetadata(value: unknown): value is ProductImageMetadataInput {
  if (!isPlainObject(value)) {
    return false;
  }

  const textFields = [
    "url",
    "title",
    "alt",
    "caption",
    "description",
    "credit",
    "license",
    "photographer",
    "focus_keyword",
    "source_url",
  ];

  return (
    textFields.every((field) => {
      const fieldValue = value[field];
      return fieldValue === undefined || fieldValue === null || typeof fieldValue === "string";
    }) &&
    (value.keywords === undefined ||
      (Array.isArray(value.keywords) &&
        value.keywords.every((keyword) => typeof keyword === "string"))) &&
    (value.enable_indexing === undefined || typeof value.enable_indexing === "boolean") &&
    (value.generate_filename === undefined || typeof value.generate_filename === "boolean")
  );
}

function isProductImageMetadataArray(value: unknown): value is ProductImageMetadataInput[] {
  return Array.isArray(value) && value.every(isProductImageMetadata);
}

function isCmsCardArray(value: unknown): value is ProductCmsCardInput[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isPlainObject(item) &&
        typeof item.title === "string" &&
        (item.description === undefined ||
          item.description === null ||
          typeof item.description === "string") &&
        (item.icon === undefined || item.icon === null || typeof item.icon === "string") &&
        (item.display_order === undefined || typeof item.display_order === "number") &&
        (item.is_active === undefined || typeof item.is_active === "boolean"),
    )
  );
}

function isHowItWorksStepArray(value: unknown): value is ProductHowItWorksStepInput[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isPlainObject(item) &&
        typeof item.description === "string" &&
        (item.title === undefined || item.title === null || typeof item.title === "string") &&
        (item.icon === undefined || item.icon === null || typeof item.icon === "string") &&
        (item.display_order === undefined || typeof item.display_order === "number") &&
        (item.is_active === undefined || typeof item.is_active === "boolean"),
    )
  );
}

function isSafetyItemArray(value: unknown): value is ProductSafetyItemInput[] {
  const itemTypes: ProductSafetyItemType[] = [
    "side_effect",
    "who_should_avoid",
    "interaction",
    "precaution",
  ];

  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isPlainObject(item) &&
        typeof item.title === "string" &&
        typeof item.item_type === "string" &&
        itemTypes.includes(item.item_type as ProductSafetyItemType) &&
        (item.description === undefined ||
          item.description === null ||
          typeof item.description === "string") &&
        (item.icon === undefined || item.icon === null || typeof item.icon === "string") &&
        (item.display_order === undefined || typeof item.display_order === "number") &&
        (item.is_active === undefined || typeof item.is_active === "boolean"),
    )
  );
}

function isSidebarFactArray(value: unknown): value is ProductSidebarFactInput[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isPlainObject(item) &&
        typeof item.label === "string" &&
        typeof item.value === "string" &&
        (item.icon === undefined || item.icon === null || typeof item.icon === "string") &&
        (item.display_order === undefined || typeof item.display_order === "number") &&
        (item.is_active === undefined || typeof item.is_active === "boolean"),
    )
  );
}

function isSidebarTrustBadgeArray(value: unknown): value is ProductSidebarTrustBadgeInput[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isPlainObject(item) &&
        typeof item.title === "string" &&
        (item.description === undefined ||
          item.description === null ||
          typeof item.description === "string") &&
        (item.icon === undefined || item.icon === null || typeof item.icon === "string") &&
        (item.display_order === undefined || typeof item.display_order === "number") &&
        isOptionalBoolean(item.is_active),
    )
  );
}

function isTocItemArray(value: unknown): value is ProductTocItemInput[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isPlainObject(item) &&
        typeof item.label === "string" &&
        typeof item.anchor_id === "string" &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.anchor_id) &&
        (item.icon === undefined || item.icon === null || typeof item.icon === "string") &&
        (item.display_order === undefined || typeof item.display_order === "number") &&
        isOptionalBoolean(item.is_visible) &&
        isOptionalBoolean(item.is_active),
    )
  );
}

function isProductLayoutSectionArray(value: unknown): value is ProductLayoutSectionInput[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isPlainObject(item) &&
        typeof item.section_key === "string" &&
        PRODUCT_LAYOUT_SECTION_KEYS.includes(item.section_key as ProductLayoutSectionKey) &&
        typeof item.is_visible === "boolean" &&
        typeof item.sort_order === "number" &&
        Number.isInteger(item.sort_order) &&
        item.sort_order >= 0 &&
        (item.title_override === undefined ||
          item.title_override === null ||
          typeof item.title_override === "string") &&
        (item.subtitle_override === undefined ||
          item.subtitle_override === null ||
          typeof item.subtitle_override === "string") &&
        (item.background_style === undefined || item.background_style === "default") &&
        typeof item.animation_enabled === "boolean",
    )
  );
}

function idsAreUnique(values: string[]) {
  return new Set(values).size === values.length;
}

export function validateProductInput<TInput extends ProductValidationInput>(
  input: TInput,
  mode: "create" | "update" = "create",
): ProductValidationResult<TInput> {
  const errors: string[] = [];

  if (mode === "create" && !("title" in input && input.title?.trim())) {
    errors.push("Product title is required.");
  }

  if ("title" in input && input.title !== undefined && input.title.trim().length < 2) {
    errors.push("Product title must be at least 2 characters.");
  }

  if ("slug" in input && input.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }

  if (
    "category_id" in input &&
    input.category_id &&
    !UUID_PATTERN.test(input.category_id)
  ) {
    errors.push("Category ID must be a valid UUID.");
  }

  if ("ingredient_ids" in input && input.ingredient_ids !== undefined) {
    if (!isStringArray(input.ingredient_ids)) {
      errors.push("Ingredient IDs must be a list of valid UUID values.");
    } else {
      const normalizedIngredientIds = input.ingredient_ids.map((value) => value.trim()).filter(Boolean);

      if (normalizedIngredientIds.some((value) => !UUID_PATTERN.test(value))) {
        errors.push("Each ingredient ID must be a valid UUID.");
      }

      if (new Set(normalizedIngredientIds).size !== normalizedIngredientIds.length) {
        errors.push("Duplicate ingredient assignments are not allowed.");
      }
    }
  }

  if ("author_id" in input && input.author_id && !UUID_PATTERN.test(input.author_id)) {
    errors.push("Author ID must be a valid UUID.");
  }

  if ("reviewer_id" in input && input.reviewer_id && !UUID_PATTERN.test(input.reviewer_id)) {
    errors.push("Reviewer ID must be a valid UUID.");
  }

  if (
    "status" in input &&
    input.status &&
    !Object.values(ContentStatus).includes(input.status)
  ) {
    errors.push("Status must be draft, published, or archived.");
  }

  if (
    "rating" in input &&
    input.rating !== undefined &&
    input.rating !== null &&
    (input.rating < 0 || input.rating > 5)
  ) {
    errors.push("Rating must be between 0 and 5.");
  }

  if ("gallery" in input && input.gallery !== undefined && !isStringArray(input.gallery)) {
    errors.push("Gallery must be a list of image URLs.");
  }

  if ("hero_checklist" in input && input.hero_checklist !== undefined && !isStringArray(input.hero_checklist)) {
    errors.push("Hero checklist must be a list of text items.");
  }

  if ("hero_show_rating" in input && input.hero_show_rating !== undefined && !isBoolean(input.hero_show_rating)) {
    errors.push("Hero rating visibility must be true or false.");
  }

  if (
    "hero_show_rating_label" in input &&
    input.hero_show_rating_label !== undefined &&
    !isBoolean(input.hero_show_rating_label)
  ) {
    errors.push("Hero rating label visibility must be true or false.");
  }

  if (
    "hero_show_review_count" in input &&
    input.hero_show_review_count !== undefined &&
    !isBoolean(input.hero_show_review_count)
  ) {
    errors.push("Hero review count visibility must be true or false.");
  }

  if ("hero_show_badge" in input && input.hero_show_badge !== undefined && !isBoolean(input.hero_show_badge)) {
    errors.push("Hero badge visibility must be true or false.");
  }

  const targetFields = [
    ["hero_cta_target", input.hero_cta_target],
    ["hero_secondary_cta_target", input.hero_secondary_cta_target],
  ] as const;

  targetFields.forEach(([field, value]) => {
    if (field in input && value && value !== "_self" && value !== "_blank") {
      errors.push(`${field} must be _self or _blank.`);
    }
  });

  if (
    "review_count" in input &&
    input.review_count !== undefined &&
    input.review_count !== null &&
    (!Number.isInteger(input.review_count) || input.review_count < 0)
  ) {
    errors.push("Review count must be a non-negative whole number.");
  }

  const urlFields = [
    ["affiliate_url", input.affiliate_url],
    ["seo_canonical_url", input.seo_canonical_url],
    ["seo_og_image", input.seo_og_image],
    ["seo_twitter_image", input.seo_twitter_image],
    ["schema_offer_url", input.schema_offer_url],
  ] as const;

  urlFields.forEach(([field, value]) => {
    if (field in input && value && !isUrlLike(value)) {
      errors.push(`${field} must be a valid URL or internal path.`);
    }
  });

  if ("sidebar_cta_url" in input && input.sidebar_cta_url && !isUrlLike(input.sidebar_cta_url)) {
    errors.push("Sidebar CTA URL must be a valid URL or internal path.");
  }

  if (
    "sidebar_cta_type" in input &&
    input.sidebar_cta_type &&
    !["affiliate", "internal", "external", "ask_expert"].includes(input.sidebar_cta_type)
  ) {
    errors.push("Sidebar CTA type is invalid.");
  }

  if (
    "sidebar_sticky_enabled" in input &&
    input.sidebar_sticky_enabled !== undefined &&
    !isBoolean(input.sidebar_sticky_enabled)
  ) {
    errors.push("Sticky sidebar setting must be true or false.");
  }

  if ("pros" in input && input.pros !== undefined && !isStringArray(input.pros)) {
    errors.push("Pros must be a list of text items.");
  }

  if ("cons" in input && input.cons !== undefined && !isStringArray(input.cons)) {
    errors.push("Cons must be a list of text items.");
  }

  if (
    "ingredients" in input &&
    input.ingredients !== undefined &&
    !isIngredientArray(input.ingredients)
  ) {
    errors.push("Ingredients must be valid ingredient objects.");
  }

  if ("faq" in input && input.faq !== undefined && !isFaqArray(input.faq)) {
    errors.push("FAQ must be valid question and answer objects.");
  }

  if ("standout_points" in input && input.standout_points !== undefined && !isCmsCardArray(input.standout_points)) {
    errors.push("Standout points must be valid title and description items.");
  }

  if ("how_it_works_steps" in input && input.how_it_works_steps !== undefined && !isHowItWorksStepArray(input.how_it_works_steps)) {
    errors.push("How it works steps must be valid description items.");
  }

  if ("best_for_items" in input && input.best_for_items !== undefined && !isCmsCardArray(input.best_for_items)) {
    errors.push("Best-for items must be valid title and description items.");
  }

  if ("safety_items" in input && input.safety_items !== undefined && !isSafetyItemArray(input.safety_items)) {
    errors.push("Safety items must use a valid type, title, and description.");
  }

  if ("buying_guide_items" in input && input.buying_guide_items !== undefined && !isCmsCardArray(input.buying_guide_items)) {
    errors.push("Buying guide items must be valid title and description items.");
  }

  if ("sidebar_facts" in input && input.sidebar_facts !== undefined && !isSidebarFactArray(input.sidebar_facts)) {
    errors.push("Sidebar facts must include a label and value.");
  }

  if ("sidebar_trust_badges" in input && input.sidebar_trust_badges !== undefined && !isSidebarTrustBadgeArray(input.sidebar_trust_badges)) {
    errors.push("Sidebar trust badges must include a title.");
  }

  if ("toc_items" in input && input.toc_items !== undefined) {
    if (!isTocItemArray(input.toc_items)) {
      errors.push("Table of contents items must include a label and valid anchor ID.");
    } else {
      const labels = input.toc_items.map((item) => item.label.trim().toLowerCase()).filter(Boolean);
      const anchors = input.toc_items.map((item) => item.anchor_id.trim().toLowerCase()).filter(Boolean);

      if (!idsAreUnique(labels)) {
        errors.push("Duplicate table of contents labels are not allowed.");
      }

      if (!idsAreUnique(anchors)) {
        errors.push("Duplicate table of contents anchor IDs are not allowed.");
      }
    }
  }

  if ("product_layout_sections" in input && input.product_layout_sections !== undefined) {
    if (!isProductLayoutSectionArray(input.product_layout_sections)) {
      errors.push("Product layout sections must include valid section keys, visibility, and sort order.");
    } else {
      const sectionKeys = input.product_layout_sections.map((item) => item.section_key);
      const sortOrders = input.product_layout_sections.map((item) => String(item.sort_order));
      const missingSectionKeys = PRODUCT_LAYOUT_SECTION_KEYS.filter(
        (sectionKey) => !sectionKeys.includes(sectionKey),
      );

      if (missingSectionKeys.length) {
        errors.push("Product layout is missing required sections.");
      }

      if (!idsAreUnique(sectionKeys)) {
        errors.push("Duplicate product layout sections are not allowed.");
      }

      if (!idsAreUnique(sortOrders)) {
        errors.push("Duplicate product layout sort orders are not allowed.");
      }
    }
  }

  if ("ingredient_overrides" in input && input.ingredient_overrides !== undefined) {
    if (!Array.isArray(input.ingredient_overrides)) {
      errors.push("Ingredient overrides must be a list.");
    } else {
      const ingredientIds = input.ingredient_overrides.map((item) => item.ingredient_id);
      if (ingredientIds.some((value) => !UUID_PATTERN.test(value))) {
        errors.push("Each ingredient override must reference a valid ingredient ID.");
      }
      if (!idsAreUnique(ingredientIds)) {
        errors.push("Duplicate ingredient overrides are not allowed.");
      }
    }
  }

  if ("related_product_relations" in input && input.related_product_relations !== undefined) {
    if (!Array.isArray(input.related_product_relations)) {
      errors.push("Related products must be a list.");
    } else {
      const productIds = input.related_product_relations.map((item) => item.related_product_id);
      if (productIds.some((value) => !UUID_PATTERN.test(value))) {
        errors.push("Each related product must reference a valid product ID.");
      }
      if (!idsAreUnique(productIds)) {
        errors.push("Duplicate related products are not allowed.");
      }
      if (input.related_product_relations.some((item) => !isOptionalBoolean(item.is_active))) {
        errors.push("Related product active flags must be true or false.");
      }
    }
  }

  if ("compare_product_relations" in input && input.compare_product_relations !== undefined) {
    if (!Array.isArray(input.compare_product_relations)) {
      errors.push("Compare products must be a list.");
    } else {
      const productIds = input.compare_product_relations.map((item) => item.compared_product_id);
      if (productIds.some((value) => !UUID_PATTERN.test(value))) {
        errors.push("Each compare product must reference a valid product ID.");
      }
      if (!idsAreUnique(productIds)) {
        errors.push("Duplicate compare products are not allowed.");
      }
      if (input.compare_product_relations.some((item) => !isOptionalBoolean(item.is_active))) {
        errors.push("Compare product active flags must be true or false.");
      }
    }
  }

  if ("related_blog_relations" in input && input.related_blog_relations !== undefined) {
    if (!Array.isArray(input.related_blog_relations)) {
      errors.push("Related blogs must be a list.");
    } else {
      const blogIds = input.related_blog_relations.map((item) => item.blog_id);
      if (blogIds.some((value) => !UUID_PATTERN.test(value))) {
        errors.push("Each related blog must reference a valid blog ID.");
      }
      if (!idsAreUnique(blogIds)) {
        errors.push("Duplicate related blogs are not allowed.");
      }
      if (input.related_blog_relations.some((item) => !isOptionalBoolean(item.is_active))) {
        errors.push("Related blog active flags must be true or false.");
      }
    }
  }

  if ("related_ingredient_relations" in input && input.related_ingredient_relations !== undefined) {
    if (!Array.isArray(input.related_ingredient_relations)) {
      errors.push("Related ingredients must be a list.");
    } else {
      const ingredientIds = input.related_ingredient_relations.map((item) => item.ingredient_id);
      if (ingredientIds.some((value) => !UUID_PATTERN.test(value))) {
        errors.push("Each related ingredient must reference a valid ingredient ID.");
      }
      if (!idsAreUnique(ingredientIds)) {
        errors.push("Duplicate related ingredients are not allowed.");
      }
      if (input.related_ingredient_relations.some((item) => !isOptionalBoolean(item.is_active))) {
        errors.push("Related ingredient active flags must be true or false.");
      }
    }
  }

  if ("seo_noindex" in input && input.seo_noindex !== undefined && !isBoolean(input.seo_noindex)) {
    errors.push("SEO noindex must be true or false.");
  }

  if (
    "seo_nofollow" in input &&
    input.seo_nofollow !== undefined &&
    !isBoolean(input.seo_nofollow)
  ) {
    errors.push("SEO nofollow must be true or false.");
  }

  const schemaToggles = [
    ["schema_enable_product", input.schema_enable_product],
    ["schema_enable_faq", input.schema_enable_faq],
    ["schema_enable_breadcrumb", input.schema_enable_breadcrumb],
    ["schema_enable_review", input.schema_enable_review],
    ["schema_enable_organization", input.schema_enable_organization],
  ] as const;

  schemaToggles.forEach(([field, value]) => {
    if (field in input && value !== undefined && !isBoolean(value)) {
      errors.push(`${field} must be true or false.`);
    }
  });

  if (
    "schema_price" in input &&
    input.schema_price !== undefined &&
    input.schema_price !== null &&
    (typeof input.schema_price !== "number" || input.schema_price < 0)
  ) {
    errors.push("Schema price must be a non-negative number.");
  }

  if (
    "schema_aggregate_rating" in input &&
    input.schema_aggregate_rating !== undefined &&
    input.schema_aggregate_rating !== null &&
    (typeof input.schema_aggregate_rating !== "number" ||
      input.schema_aggregate_rating < 0 ||
      input.schema_aggregate_rating > 5)
  ) {
    errors.push("Schema aggregate rating must be between 0 and 5.");
  }

  if (
    "schema_review_count" in input &&
    input.schema_review_count !== undefined &&
    input.schema_review_count !== null &&
    (!Number.isInteger(input.schema_review_count) || input.schema_review_count < 0)
  ) {
    errors.push("Schema review count must be a non-negative whole number.");
  }

  if (
    "product_image_metadata" in input &&
    input.product_image_metadata !== undefined &&
    !isProductImageMetadata(input.product_image_metadata)
  ) {
    errors.push("Product image metadata must be a valid metadata object.");
  }

  if (
    "gallery_image_metadata" in input &&
    input.gallery_image_metadata !== undefined &&
    !isProductImageMetadataArray(input.gallery_image_metadata)
  ) {
    errors.push("Gallery image metadata must be a valid metadata list.");
  }

  return {
    success: errors.length === 0,
    data: input,
    errors,
  };
}

export type ProductRecordInput = Omit<
  Product,
  "id" | "name" | "created_at" | "updated_at" | "deleted_at"
>;
