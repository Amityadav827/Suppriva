"use client";

import { motion } from "framer-motion";
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
        </motion.div>
      ))}
    </div>
  );
}
