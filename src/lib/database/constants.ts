export enum UserRole {
  Admin = "admin",
  Editor = "editor",
  User = "user",
}

export enum ContentStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

export enum SubscriberStatus {
  Active = "active",
  Unsubscribed = "unsubscribed",
  Pending = "pending",
}

export enum UserStatus {
  Active = "active",
  Suspended = "suspended",
  Pending = "pending",
}

export enum PageType {
  Home = "home",
  Product = "product",
  Category = "category",
  Blog = "blog",
  Ingredient = "ingredient",
  Search = "search",
  Static = "static",
}

export const EXPERT_STATUSES = ["active", "inactive"] as const;
export type ExpertStatus = (typeof EXPERT_STATUSES)[number];

export const DATABASE_TABLES = {
  categories: "categories",
  products: "products",
  blogs: "blogs",
  authors: "authors",
  reviewers: "reviewers",
  experts: "experts",
  users: "users",
  seo: "seo",
  ingredients: "ingredients",
  productIngredients: "product_ingredients",
  productStandoutPoints: "product_standout_points",
  productHowItWorksSteps: "product_how_it_works_steps",
  productBestForItems: "product_best_for_items",
  productSafetyItems: "product_safety_items",
  productBuyingGuideItems: "product_buying_guide_items",
  productSidebarFacts: "product_sidebar_facts",
  productIngredientOverrides: "product_ingredient_overrides",
  productRelatedProducts: "product_related_products",
  productCompareProducts: "product_compare_products",
  productRelatedBlogs: "product_related_blogs",
  productRelatedIngredients: "product_related_ingredients",
  newsletterSubscribers: "newsletter_subscribers",
  contactMessages: "contact_messages",
  expertQueries: "expert_queries",
  affiliateClicks: "affiliate_clicks",
  mediaLibrary: "media_library",
  siteSettings: "site_settings",
} as const;

export const TIMESTAMP_FIELDS = ["created_at", "updated_at"] as const;
