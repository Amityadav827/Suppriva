"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryProduct } from "@/lib/category-data";

export function CategoryProductCard({ product }: { product: CategoryProduct }) {
  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative h-full rounded-[28px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium-hover focus-within:border-gold focus-within:shadow-premium-hover"
    >
      <Link
        href={product.href || `/product/${product.slug}`}
        aria-label={`View ${product.name}`}
        className="absolute inset-0 z-20 rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      />
      <div
        className={cn(
          "relative mb-5 flex h-[220px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br",
          product.accent,
        )}
      >
        <span
          aria-hidden="true"
          className={cn("absolute size-32 rounded-full blur-2xl transition duration-300 group-hover:scale-110", product.glow)}
        />
        <Image
          src={product.image || "/assets/hero-supplements.webp"}
          alt={`${product.name} supplement`}
          fill
          sizes="260px"
          className="object-contain p-5 drop-shadow-[0_24px_28px_rgba(6,57,33,0.18)] transition duration-500 group-hover:scale-110"
        />
      </div>

      <p className="relative z-10 font-heading text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">
        {product.category}
      </p>
      <h3 className="relative z-10 mt-2 font-heading text-xl font-extrabold text-text-dark">
        {product.name}
      </h3>
      <p className="relative z-10 mt-3 min-h-16 text-sm leading-6 text-muted">
        {product.description}
      </p>
      <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold/24 bg-gold/10 px-3 py-1.5 font-heading text-sm font-semibold text-text-dark">
          <Star className="size-4 fill-gold text-gold" aria-hidden="true" />
          {product.rating}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 font-heading text-xs font-semibold text-white transition duration-300 group-hover:bg-button-hover">
          Visit Product
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </motion.article>
  );
}
