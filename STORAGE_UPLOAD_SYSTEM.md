# Suppriva Storage Upload System

## Buckets

- `category-images`
- `product-images`
- `blog-images`

Run `SUPABASE_STORAGE_SETUP.sql` in Supabase SQL Editor to create or update the buckets and storage RLS policies.

## Dashboard Flow

The admin dashboard now uploads images directly from the browser to Supabase Storage:

- Categories save the uploaded public URL into the existing `categories.image` field.
- Products save the uploaded public URL into the existing `products.image` field.
- Blogs save the uploaded public URL into the existing `blogs.featured_image` field.

The manual URL input remains available as a fallback inside the uploader.

## Validation

Client-side validation allows:

- JPG / JPEG
- PNG
- WEBP
- Maximum size: 5MB

The buckets are configured with matching MIME type and file size limits.

## Security

- Public users can read images from the three public buckets.
- Only authenticated active admin users can insert, update, or delete images.
- Admin authorization reuses `public.is_suppriva_admin()`.

## Verification

After running the SQL package and signing in as an admin:

1. Open `/dashboard/categories`, upload a category image, save, and confirm `categories.image` contains the public URL.
2. Open `/dashboard/products`, upload a product image, save, and confirm `products.image` contains the public URL.
3. Open `/dashboard/blogs`, upload a featured image, save, and confirm `blogs.featured_image` contains the public URL.
