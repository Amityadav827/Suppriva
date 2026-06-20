export function buildProductPath(productSlug: string, categorySlug?: string | null) {
  const normalizedProductSlug = productSlug.trim();
  const normalizedCategorySlug = categorySlug?.trim();

  if (normalizedCategorySlug) {
    return `/${normalizedCategorySlug}/${normalizedProductSlug}`;
  }

  return `/product/${normalizedProductSlug}`;
}
