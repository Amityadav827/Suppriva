"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductCardData = {
  slug?: string;
  href?: string;
  name: string;
  subtitle: string;
  category: string;
  rating: string;
  image?: string;
  glow: string;
  accent: string;
};

type ProductCardProps = {
  product: ProductCardData;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative flex h-full flex-col rounded-card border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium-hover focus-within:border-gold focus-within:shadow-premium-hover"
    >
      {product.slug ? (
        <a
          href={product.href || `/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-20 rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        />
      ) : null}
      <div
        className={cn(
          "relative mb-5 flex h-[210px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br",
          product.accent,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute size-32 rounded-full blur-2xl transition duration-300 group-hover:scale-110",
            product.glow,
          )}
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-[188px] w-[190px]"
        >
          <Image
            src={product.image || "/assets/hero-supplements.webp"}
            alt={`${product.name} supplement bottle`}
            fill
            sizes="190px"
            className="object-contain drop-shadow-[0_24px_28px_rgba(6,57,33,0.18)] transition duration-500 group-hover:scale-110"
          />
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col text-center">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">
          {product.category}
        </p>
        <h3 className="mt-2 font-heading text-xl font-extrabold text-text-dark">
          {product.name}
        </h3>
        <p className="mt-2 min-h-[88px] flex-1 text-sm leading-6 text-muted">
          {product.subtitle}
        </p>
        <div className="mt-auto flex items-center justify-center gap-3 pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold/35 bg-[linear-gradient(135deg,rgba(217,165,32,0.18),rgba(255,255,255,0.95))] px-3.5 py-2 font-heading text-sm font-bold text-text-dark shadow-[0_10px_26px_rgba(217,165,32,0.14)]">
          <Star className="size-4 fill-gold text-gold" aria-hidden="true" />
          {product.rating}
        </span>
        {product.slug ? (
          <span
            className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-primary px-4 py-2 font-heading text-xs font-semibold text-white shadow-[0_12px_28px_rgba(11,93,59,0.18)] transition duration-300 group-hover:bg-button-hover group-hover:shadow-[0_16px_36px_rgba(11,93,59,0.24)]"
          >
            View Product
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        ) : null}
        </div>
      </div>
    </motion.article>
  );
}
