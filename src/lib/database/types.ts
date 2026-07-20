import {
  ContentStatus,
  type ExpertStatus,
  PageType,
  SubscriberStatus,
  UserRole,
  UserStatus,
} from "./constants";
import type { IngredientLayoutSectionKey } from "@/lib/ingredient-layout";
import type { HomepageSectionKey } from "@/lib/homepage-sections";
import type {
  HomepageHeroFloatingPill,
  HomepageHeroSettings,
  HomepageHeroTrustCard,
} from "@/lib/homepage-hero";
import type { ProductLayoutSectionKey } from "@/lib/product-layout";

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
  display_order?: number;
  is_visible?: boolean;
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
  hero_badge: string | null;
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
  overview_title: string | null;
  overview_subtitle: string | null;
  how_it_works_content: string | null;
  how_it_works_title: string | null;
  how_it_works_subtitle: string | null;
  how_it_works_highlight_title: string | null;
  how_it_works_highlight_description: string | null;
  interesting_fact_label: string | null;
  interesting_fact: string | null;
  benefits_title: string | null;
  benefits_subtitle: string | null;
  uses_title: string | null;
  uses_subtitle: string | null;
  uses_content: string | null;
  uses_json: JsonValue[];
  food_sources_title: string | null;
  food_sources_subtitle: string | null;
  food_sources_content: string | null;
  food_sources_json: JsonValue[];
  dosage_title: string | null;
  dosage_subtitle: string | null;
  dosage_content: string | null;
  safety_title: string | null;
  safety_subtitle: string | null;
  research_title: string | null;
  research_subtitle: string | null;
  research_content: string | null;
  research_json: JsonValue[];
  references_title: string | null;
  references_subtitle: string | null;
  references_json: JsonValue[];
  faq_title: string | null;
  faq_subtitle: string | null;
  sidebar_profile_title: string | null;
  sidebar_profile_content: string | null;
  sidebar_quick_facts_json: IngredientSidebarQuickFact[];
  sidebar_at_a_glance_content: string | null;
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
  seo_focus_keyword: string | null;
  seo_canonical_url: string | null;
  seo_og_title: string | null;
  seo_og_description: string | null;
  seo_og_image: string | null;
  seo_twitter_title: string | null;
  seo_twitter_description: string | null;
  seo_twitter_image: string | null;
  meta_image: string | null;
  seo_noindex: boolean;
  seo_nofollow: boolean;
  schema_json: JsonValue;
  ingredient_layout_sections: IngredientLayoutSection[];
  is_featured: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
};

export type IngredientLayoutSection = {
  section_key: IngredientLayoutSectionKey;
  is_visible: boolean;
  sort_order: number;
  title_override: string | null;
  subtitle_override: string | null;
  background_style: "default";
  animation_enabled: boolean;
};

export type IngredientSidebarQuickFact = {
  label: string;
  value: string;
};

export type ProductIngredientRelation = {
  id: string;
  product_id: string;
  ingredient_id: string;
  created_at: Timestamp;
};

export type ProductCmsCard = {
  id: string;
  product_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProductHowItWorksStep = Omit<ProductCmsCard, "title"> & {
  title: string | null;
};

export type ProductSafetyItemType =
  | "side_effect"
  | "who_should_avoid"
  | "interaction"
  | "precaution";

export type ProductSafetyItem = ProductCmsCard & {
  item_type: ProductSafetyItemType;
};

export type ProductSidebarFact = {
  id: string;
  product_id: string;
  label: string;
  value: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProductSidebarTrustBadge = {
  id: string;
  product_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProductTocItem = {
  id: string;
  product_id: string;
  label: string;
  anchor_id: string;
  icon: string | null;
  display_order: number;
  is_visible: boolean;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProductLayoutSection = {
  id: string;
  product_id: string;
  section_key: ProductLayoutSectionKey;
  is_visible: boolean;
  sort_order: number;
  title_override: string | null;
  subtitle_override: string | null;
  background_style: "default";
  animation_enabled: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProductIngredientOverride = {
  id: string;
  product_id: string;
  ingredient_id: string;
  display_order: number;
  purpose: string | null;
  dosage: string | null;
  description_override: string | null;
  custom_note: string | null;
  is_highlighted: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProductImageMetadata = {
  url?: string | null;
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  description?: string | null;
  credit?: string | null;
  license?: string | null;
  photographer?: string | null;
  keywords?: string[];
  focus_keyword?: string | null;
  source_url?: string | null;
  enable_indexing?: boolean;
  generate_filename?: boolean;
};

export type ProductRelatedProduct = {
  id: string;
  product_id: string;
  related_product_id: string;
  display_order: number;
  relationship_type: string;
  title_override: string | null;
  description_override: string | null;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProductCompareProduct = {
  id: string;
  product_id: string;
  compared_product_id: string;
  display_order: number;
  title_override: string | null;
  description_override: string | null;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProductRelatedBlog = {
  id: string;
  product_id: string;
  blog_id: string;
  display_order: number;
  title_override: string | null;
  description_override: string | null;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProductRelatedIngredient = {
  id: string;
  product_id: string;
  ingredient_id: string;
  display_order: number;
  title_override: string | null;
  description_override: string | null;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
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
  seo_focus_keyword: string | null;
  seo_canonical_url: string | null;
  seo_noindex: boolean;
  seo_nofollow: boolean;
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
  hero_badge: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_description: string | null;
  hero_image_alt: string | null;
  hero_cta_label: string | null;
  hero_cta_target: "_self" | "_blank" | null;
  hero_secondary_cta_label: string | null;
  hero_secondary_cta_target: "_self" | "_blank" | null;
  hero_checklist: string[];
  hero_show_rating: boolean;
  hero_show_rating_label: boolean;
  hero_show_review_count: boolean;
  hero_show_badge: boolean;
  review_count: number | null;
  rating_label: string | null;
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
  overview_title: string | null;
  overview_subtitle: string | null;
  overview_content: string | null;
  how_it_works_title: string | null;
  how_it_works_subtitle: string | null;
  how_it_works_content: string | null;
  benefits_title: string | null;
  benefits_subtitle: string | null;
  ingredients_title: string | null;
  ingredients_subtitle: string | null;
  best_for_title: string | null;
  best_for_subtitle: string | null;
  safety_title: string | null;
  safety_subtitle: string | null;
  pros_cons_title: string | null;
  pros_cons_subtitle: string | null;
  faq_title: string | null;
  faq_subtitle: string | null;
  verdict_title: string | null;
  verdict_subtitle: string | null;
  verdict_summary: string | null;
  verdict_best_for: string | null;
  verdict_not_ideal_for: string | null;
  verdict_recommendation: string | null;
  verdict_conclusion: string | null;
  buying_guide_title: string | null;
  buying_guide_subtitle: string | null;
  buying_guidance_content: string | null;
  buying_cta_label: string | null;
  related_ingredients_title: string | null;
  related_ingredients_subtitle: string | null;
  related_blogs_title: string | null;
  related_blogs_subtitle: string | null;
  compare_title: string | null;
  compare_subtitle: string | null;
  related_products_title: string | null;
  related_products_subtitle: string | null;
  health_needs_title: string | null;
  health_needs_subtitle: string | null;
  sidebar_heading: string | null;
  sidebar_description: string | null;
  sidebar_cta_title: string | null;
  sidebar_cta_description: string | null;
  sidebar_cta_label: string | null;
  sidebar_cta_url: string | null;
  sidebar_cta_type: "affiliate" | "internal" | "external" | "ask_expert" | null;
  sidebar_sticky_enabled: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical_url: string | null;
  seo_og_title: string | null;
  seo_og_description: string | null;
  seo_og_image: string | null;
  seo_noindex: boolean;
  seo_focus_keyword: string | null;
  seo_nofollow: boolean;
  seo_twitter_title: string | null;
  seo_twitter_description: string | null;
  seo_twitter_image: string | null;
  schema_brand: string | null;
  schema_sku: string | null;
  schema_mpn: string | null;
  schema_gtin: string | null;
  schema_price: number | null;
  schema_currency: string | null;
  schema_availability: string | null;
  schema_aggregate_rating: number | null;
  schema_review_count: number | null;
  schema_offer_url: string | null;
  schema_enable_product: boolean;
  schema_enable_faq: boolean;
  schema_enable_breadcrumb: boolean;
  schema_enable_review: boolean;
  schema_enable_organization: boolean;
  schema_json: JsonValue;
  product_image_metadata: ProductImageMetadata;
  gallery_image_metadata: ProductImageMetadata[];
  standout_points?: ProductCmsCard[];
  how_it_works_steps?: ProductHowItWorksStep[];
  best_for_items?: ProductCmsCard[];
  safety_items?: ProductSafetyItem[];
  buying_guide_items?: ProductCmsCard[];
  sidebar_facts?: ProductSidebarFact[];
  sidebar_trust_badges?: ProductSidebarTrustBadge[];
  toc_items?: ProductTocItem[];
  product_layout_sections?: ProductLayoutSection[];
  ingredient_overrides?: ProductIngredientOverride[];
  related_product_relations?: ProductRelatedProduct[];
  compare_product_relations?: ProductCompareProduct[];
  related_blog_relations?: ProductRelatedBlog[];
  related_ingredient_relations?: ProductRelatedIngredient[];
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
  seo_focus_keyword: string | null;
  seo_canonical_url: string | null;
  seo_noindex: boolean;
  seo_nofollow: boolean;
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

export type HomepageSection = {
  id: string;
  section_key: HomepageSectionKey;
  section_name: string;
  is_visible: boolean;
  sort_order: number;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
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
  product_standout_points: ProductCmsCard;
  product_how_it_works_steps: ProductHowItWorksStep;
  product_best_for_items: ProductCmsCard;
  product_safety_items: ProductSafetyItem;
  product_buying_guide_items: ProductCmsCard;
  product_sidebar_facts: ProductSidebarFact;
  product_sidebar_trust_badges: ProductSidebarTrustBadge;
  product_toc_items: ProductTocItem;
  product_layout_sections: ProductLayoutSection;
  product_ingredient_overrides: ProductIngredientOverride;
  product_related_products: ProductRelatedProduct;
  product_compare_products: ProductCompareProduct;
  product_related_blogs: ProductRelatedBlog;
  product_related_ingredients: ProductRelatedIngredient;
  newsletter_subscribers: NewsletterSubscriber;
  homepage_sections: HomepageSection;
  homepage_hero_settings: HomepageHeroSettings & { id: string };
  homepage_hero_trust_cards: HomepageHeroTrustCard & { id: string };
  homepage_hero_floating_pills: HomepageHeroFloatingPill & { id: string };
  contact_messages: ContactMessage;
  expert_queries: ExpertQuery;
  affiliate_clicks: AffiliateClick;
  media_library: MediaLibraryItem;
  site_settings: SiteSettings;
};
