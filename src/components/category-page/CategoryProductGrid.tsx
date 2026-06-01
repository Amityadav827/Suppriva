"use client";

import { GridWrapper } from "@/components/layout/GridWrapper";
import { CategoryProductCard } from "@/components/category-page/CategoryProductCard";
import type { CategoryProduct } from "@/lib/category-data";

export function CategoryProductGrid({ products }: { products: CategoryProduct[] }) {
  return (
    <GridWrapper className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <CategoryProductCard key={product.name} product={product} />
      ))}
    </GridWrapper>
  );
}
