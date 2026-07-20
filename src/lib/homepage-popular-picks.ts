import type { Product } from "@/lib/database/types";

type Timestamp = string;

export const HOMEPAGE_POPULAR_PICK_SORT_MODES = [
  "latest",
  "featured",
  "highest_rated",
  "manual_priority",
] as const;

export const HOMEPAGE_POPULAR_PICK_SOURCE_MODES = [
  "automatic",
  "featured_only",
] as const;

export type HomepagePopularPickSortMode =
  (typeof HOMEPAGE_POPULAR_PICK_SORT_MODES)[number];

export type HomepagePopularPickSourceMode =
  (typeof HOMEPAGE_POPULAR_PICK_SOURCE_MODES)[number];

export type HomepagePopularPicksSettings = {
  id?: string;
  max_products: number;
  sort_mode: HomepagePopularPickSortMode;
  source_mode: HomepagePopularPickSourceMode;
  show_product_rating: boolean;
  show_product_category: boolean;
  show_product_cta: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type HomepagePopularPicksCms = {
  settings: HomepagePopularPicksSettings;
};

export const DEFAULT_HOMEPAGE_POPULAR_PICKS: HomepagePopularPicksCms = {
  settings: {
    max_products: 8,
    sort_mode: "latest",
    source_mode: "automatic",
    show_product_rating: true,
    show_product_category: true,
    show_product_cta: true,
  },
};

function timestampValue(value: string | null | undefined) {
  return value ? new Date(value).getTime() : 0;
}

function latestTime(product: Product) {
  return timestampValue(product.published_at) || timestampValue(product.created_at);
}

function productRecord(product: Product) {
  return product as Product & Record<string, unknown>;
}

function hasFeaturedSignal(product: Product) {
  const record = productRecord(product);
  const badge = typeof product.hero_badge === "string" ? product.hero_badge : "";

  return (
    record.is_featured === true ||
    record.featured === true ||
    record.homepage_featured === true ||
    record.homepageFeatured === true ||
    badge.toLowerCase().includes("featured") ||
    badge.toLowerCase().includes("best seller") ||
    badge.toLowerCase().includes("popular")
  );
}

function manualPriority(product: Product) {
  const record = productRecord(product);
  const priority =
    typeof record.homepage_priority === "number"
      ? record.homepage_priority
      : typeof record.homepagePriority === "number"
        ? record.homepagePriority
        : typeof record.manual_priority === "number"
          ? record.manual_priority
          : typeof record.manualPriority === "number"
            ? record.manualPriority
            : null;

  return priority !== null && Number.isFinite(priority) ? priority : null;
}

export function isHomepagePopularPickSortMode(
  value: string,
): value is HomepagePopularPickSortMode {
  return (HOMEPAGE_POPULAR_PICK_SORT_MODES as readonly string[]).includes(value);
}

export function isHomepagePopularPickSourceMode(
  value: string,
): value is HomepagePopularPickSourceMode {
  return (HOMEPAGE_POPULAR_PICK_SOURCE_MODES as readonly string[]).includes(value);
}

export function mergeHomepagePopularPicksCms(
  input: Partial<HomepagePopularPicksCms> | null | undefined,
) {
  const settings = input?.settings;
  const maxProducts =
    typeof settings?.max_products === "number" && settings.max_products > 0
      ? Math.min(Math.floor(settings.max_products), 20)
      : DEFAULT_HOMEPAGE_POPULAR_PICKS.settings.max_products;

  return {
    settings: {
      ...DEFAULT_HOMEPAGE_POPULAR_PICKS.settings,
      ...settings,
      max_products: maxProducts,
      sort_mode:
        settings?.sort_mode && isHomepagePopularPickSortMode(settings.sort_mode)
          ? settings.sort_mode
          : DEFAULT_HOMEPAGE_POPULAR_PICKS.settings.sort_mode,
      source_mode:
        settings?.source_mode &&
        isHomepagePopularPickSourceMode(settings.source_mode)
          ? settings.source_mode
          : DEFAULT_HOMEPAGE_POPULAR_PICKS.settings.source_mode,
      show_product_rating:
        typeof settings?.show_product_rating === "boolean"
          ? settings.show_product_rating
          : DEFAULT_HOMEPAGE_POPULAR_PICKS.settings.show_product_rating,
      show_product_category:
        typeof settings?.show_product_category === "boolean"
          ? settings.show_product_category
          : DEFAULT_HOMEPAGE_POPULAR_PICKS.settings.show_product_category,
      show_product_cta:
        typeof settings?.show_product_cta === "boolean"
          ? settings.show_product_cta
          : DEFAULT_HOMEPAGE_POPULAR_PICKS.settings.show_product_cta,
    },
  };
}

export function selectHomepagePopularProducts(
  products: Product[],
  settings: HomepagePopularPicksSettings,
) {
  const sourceProducts =
    settings.source_mode === "featured_only"
      ? products.filter(hasFeaturedSignal)
      : products;
  const sortableProducts = [...(sourceProducts.length ? sourceProducts : products)];

  if (settings.sort_mode === "featured") {
    const featuredProducts = sortableProducts
      .filter(hasFeaturedSignal)
      .sort((a, b) => latestTime(b) - latestTime(a));

    return (featuredProducts.length ? featuredProducts : sortableProducts).slice(
      0,
      settings.max_products,
    );
  }

  if (settings.sort_mode === "highest_rated") {
    return sortableProducts
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || latestTime(b) - latestTime(a))
      .slice(0, settings.max_products);
  }

  if (settings.sort_mode === "manual_priority") {
    sortableProducts.sort((a, b) => {
      const priorityA = manualPriority(a);
      const priorityB = manualPriority(b);

      if (priorityA !== null && priorityB !== null && priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      if (priorityA !== null) return -1;
      if (priorityB !== null) return 1;

      return latestTime(b) - latestTime(a);
    });

    return sortableProducts.slice(0, settings.max_products);
  }

  return sortableProducts
    .sort((a, b) => latestTime(b) - latestTime(a))
    .slice(0, settings.max_products);
}
