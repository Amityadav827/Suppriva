import {
  ContentStatus,
  type ExpertStatus,
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

export type ProductIngredient = {
  name: string;
  description: string;
  amount?: string;
  image?: string;
};

export type Ingredient = {
  id: string;
  name: string;
  slug: string;
  status: ContentStatus;
  author_id: string | null;
  reviewer_id: string | null;
  scientific_name: string | null;
  ingredient_category: string | null;
  short_description: string | null;
  full_description: string | null;
  image_url: string | null;
  rating: number | null;
  evidence_level: string | null;
  origin_country: string | null;
  part_used: string | null;
  ingredient_form: string | null;
  taste_profile: string | null;
  typical_dose: string | null;
  best_for: string | null;
  safety_level: string | null;
  overview_content: string | null;
  how_it_works_content: string | null;
  interesting_fact: string | null;
  benefits: string[];
  side_effects: string[];
  dosage: string | null;
  scientific_notes: string | null;
  benefits_json: JsonValue[];
  side_effects_json: JsonValue[];
  drug_interactions_json: JsonValue[];
  who_should_avoid_json: JsonValue[];
  faq_json: FAQItem[];
  related_ingredients_json: JsonValue[];
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_featured: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};

export type ProductIngredientRelation = {
  id: string;
  product_id: string;
  ingredient_id: string;
  created_at: Timestamp;
};

export type IngredientListResponse = {
  ingredients: Ingredient[];
  total: number;
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
  ingredient_ids?: string[];
  author_id: string | null;
  reviewer_id: string | null;
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
  ingredients: ProductIngredient[];
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

export type ProductImportStatus =
  | "pending"
  | "completed"
  | "completed_with_errors"
  | "failed";

export type ProductImportLog = {
  id: string;
  filename: string;
  total_rows: number;
  imported_rows: number;
  failed_rows: number;
  status: ProductImportStatus;
  created_at: Timestamp;
};

export type Blog = {
  id: string;
  category_id: string | null;
  author_id: string | null;
  reviewer_id: string | null;
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

export type ExpertProfile = {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  designation: string | null;
  qualification: string | null;
  experience_years: number | null;
  bio: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  email: string | null;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Author = ExpertProfile;

export type Reviewer = ExpertProfile;

export type ExpertContentReviewedItem = {
  label: string;
  value: number;
  description?: string | null;
};

export type Expert = {
  id: string;
  name: string;
  slug: string;
  profile_image: string | null;
  designation: string | null;
  short_bio: string | null;
  full_bio: string | null;
  editorial_contribution: string | null;
  content_reviewed: ExpertContentReviewedItem[];
  experience_years: number | null;
  linkedin_url: string | null;
  website_url: string | null;
  email: string | null;
  expertise_tags: string[];
  status: ExpertStatus;
  display_order: number;
  featured_on_homepage: boolean;
  seo_title: string | null;
  seo_description: string | null;
  meta_image: string | null;
  linked_author_id: string | null;
  linked_reviewer_id: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ExpertAttribution = {
  author: Author;
  reviewer: Reviewer;
  lastUpdated: Timestamp | null;
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

export type ExpertQueryStatus = "new" | "contacted" | "resolved";

export type ExpertQuery = {
  id: string;
  name: string;
  email: string;
  category: string | null;
  expert_id: string | null;
  product_name: string | null;
  product_url: string | null;
  question_type: string;
  message: string;
  status: ExpertQueryStatus;
  created_at: Timestamp;
  updated_at: Timestamp | null;
  resolved_at: Timestamp | null;
  source_page: string | null;
};

export type AffiliateClick = {
  id: string;
  product_id: string;
  clicked_at: Timestamp;
  source_page: string | null;
  country: string | null;
  device: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  referrer: string | null;
  created_at: Timestamp;
  deleted_at: Timestamp | null;
};

export type MediaLibraryItem = {
  id: string;
  file_name: string;
  file_url: string;
  title: string;
  alt_text: string | null;
  caption: string | null;
  description: string | null;
  slug: string;
  tags: string[];
  width: number | null;
  height: number | null;
  file_size: number | null;
  mime_type: string;
  created_at: Timestamp;
  updated_at: Timestamp;
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
  product_import_logs: ProductImportLog;
  blogs: Blog;
  authors: Author;
  reviewers: Reviewer;
  experts: Expert;
  users: User;
  seo: SEO;
  ingredients: Ingredient;
  product_ingredients: ProductIngredientRelation;
  newsletter_subscribers: NewsletterSubscriber;
  contact_messages: ContactMessage;
  expert_queries: ExpertQuery;
  affiliate_clicks: AffiliateClick;
  media_library: MediaLibraryItem;
  site_settings: SiteSettings;
};
