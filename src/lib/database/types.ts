import {
  ContentStatus,
  PageType,
  SubscriberStatus,
  UserRole,
  UserStatus,
} from "./constants";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type Timestamp = string;

export type SocialLinks = {
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  x?: string;
  youtube?: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type Ingredient = {
  name: string;
  description: string;
  amount?: string;
  image?: string;
};

export type Category = {
  id: string;
  title: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};

export type Product = {
  id: string;
  category_id: string | null;
  title: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  image: string | null;
  gallery: string[];
  rating: number | null;
  affiliate_url: string | null;
  pros: string[];
  cons: string[];
  ingredients: Ingredient[];
  benefits: JsonValue[];
  faq: FAQItem[];
  status: ContentStatus;
  published_at: Timestamp | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};

export type Blog = {
  id: string;
  category_id: string | null;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: JsonValue;
  featured_image: string | null;
  reading_time: string | null;
  tags: string[];
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  published_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};

export type Author = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  social_links: SocialLinks;
  created_at: Timestamp;
};

export type User = {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  avatar: string | null;
  status: UserStatus;
  created_at: Timestamp;
};

export type SEO = {
  id: string;
  page_type: PageType;
  page_id: string | null;
  page_slug: string | null;
  meta_title: string;
  meta_description: string;
  canonical_url: string | null;
  schema_json: JsonValue;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: SubscriberStatus;
  source_page: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: Timestamp;
};

export type AffiliateClick = {
  id: string;
  product_id: string;
  clicked_at: Timestamp;
  source_page: string | null;
  country: string | null;
  device: string | null;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};

export type SiteSettings = {
  id: string;
  site_name: string;
  logo: string | null;
  favicon: string | null;
  social_links: SocialLinks;
  footer_content: JsonValue;
  contact_email: string | null;
  updated_at: Timestamp;
};

export type Database = {
  categories: Category;
  products: Product;
  blogs: Blog;
  authors: Author;
  users: User;
  seo: SEO;
  newsletter_subscribers: NewsletterSubscriber;
  contact_messages: ContactMessage;
  affiliate_clicks: AffiliateClick;
  site_settings: SiteSettings;
};
