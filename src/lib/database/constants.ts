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
  newsletterSubscribers: "newsletter_subscribers",
  contactMessages: "contact_messages",
  expertQueries: "expert_queries",
  affiliateClicks: "affiliate_clicks",
  mediaLibrary: "media_library",
  siteSettings: "site_settings",
} as const;

export const TIMESTAMP_FIELDS = ["created_at", "updated_at"] as const;
