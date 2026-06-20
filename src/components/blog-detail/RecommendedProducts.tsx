"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";

export function RecommendedProducts({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {products.map((product) => (
        <motion.div
          key={product.name}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="rounded-[30px] border border-border-light bg-white p-3 shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
        >
          <ProductCard product={product} />
          {product.slug ? (
            <Link
              href={product.href || `/product/${product.slug}`}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white transition duration-300 hover:bg-button-hover"
            >
              View Product
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}
