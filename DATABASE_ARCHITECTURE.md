# SUPPRIVA Database Architecture

This document defines the future-ready database architecture for SUPPRIVA. It is planning-only: no Supabase client, CRUD API, or backend connection is implemented yet.

## Tables

### categories
Stores supplement category landing pages such as Weight Loss, Brain Health, Gut Health, and Sleep Support.

Fields: `id`, `name`, `slug`, `description`, `image`, `seo_title`, `seo_description`, `created_at`, `updated_at`.

### products
Stores affiliate supplement products and product detail page content.

Fields: `id`, `category_id`, `name`, `slug`, `short_description`, `full_description`, `image`, `gallery`, `rating`, `affiliate_url`, `pros`, `cons`, `ingredients`, `faq`, `status`, `seo_title`, `seo_description`, `created_at`, `updated_at`.

### blogs
Stores SEO articles, editorial guides, and blog detail page content.

Fields: `id`, `category_id`, `author_id`, `title`, `slug`, `excerpt`, `content`, `featured_image`, `reading_time`, `status`, `seo_title`, `seo_description`, `published_at`, `created_at`, `updated_at`.

### authors
Stores editorial author profiles.

Fields: `id`, `name`, `slug`, `bio`, `avatar`, `social_links`, `created_at`.

### users
Stores admin, editor, and user account profile records.

Fields: `id`, `full_name`, `email`, `role`, `avatar`, `status`, `created_at`.

Roles: `admin`, `editor`, `user`.

### seo
Central metadata and structured data table for SEO automation.

Fields: `id`, `page_type`, `page_slug`, `meta_title`, `meta_description`, `canonical_url`, `schema_json`, `updated_at`.

### newsletter_subscribers
Stores newsletter signups and subscription status.

Fields: `id`, `email`, `status`, `created_at`.

### affiliate_clicks
Stores affiliate click analytics for products.

Fields: `id`, `product_id`, `clicked_at`, `source_page`, `country`, `device`.

### site_settings
Stores global brand and site configuration.

Fields: `id`, `site_name`, `logo`, `favicon`, `social_links`, `footer_content`, `contact_email`, `updated_at`.

## Relationships

`categories` -> `products`: one category can have many products.

`categories` -> `blogs`: one category can have many blogs.

`authors` -> `blogs`: one author can write many blogs.

`products` -> `affiliate_clicks`: one product can receive many affiliate clicks.

## Dashboard Mapping

Dashboard overview:
- Reads aggregate counts from `products`, `categories`, `blogs`, `users`, and `affiliate_clicks`.
- Recent activity can later be derived from audit logs or latest updated records.

Products dashboard:
- CRUD maps to `products`.
- Category dropdown maps to `categories`.
- Analytics links map to `affiliate_clicks`.

Categories dashboard:
- CRUD maps to `categories`.
- Category SEO fields map directly to `seo_title` and `seo_description`.

Blogs dashboard:
- CRUD maps to `blogs`.
- Author dropdown maps to `authors`.
- Category dropdown maps to `categories`.

Users dashboard:
- Role and account management maps to `users`.

SEO dashboard:
- Page-level metadata maps to `seo`.
- Product/category/blog fallback metadata also exists on each content table for fast reads.

Newsletter dashboard:
- Subscriber list and statuses map to `newsletter_subscribers`.

Settings dashboard:
- Global brand/footer/social settings map to `site_settings`.

## Future Supabase Readiness

The schema is Supabase-ready:
- Primary keys use UUIDs.
- JSONB fields are used for flexible content blocks, social links, FAQs, ingredients, schema markup, and footer content.
- Slugs are unique and indexed for dynamic route lookups.
- Status fields are enum-ready for content workflows.
- Foreign keys are planned for product/category, blog/category, blog/author, and affiliate click/product relationships.
- Timestamp fields are consistent and migration-friendly.

Recommended future additions:
- Row Level Security policies for `users`, admin-only tables, and public published content.
- Database triggers for `updated_at`.
- Audit log table for admin activity.
- View or RPC functions for dashboard aggregate metrics.
- Full-text search indexes for products, categories, and blogs.

This architecture is production-ready as a planning layer and scalable for future Supabase migrations, API routes, dashboard CRUD, analytics, and SEO automation.
