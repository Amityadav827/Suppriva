"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShowcaseProductData = {
  slug?: string;
  name: string;
  category: string;
  rating: string;
  image?: string;
  accent: string;
  imageScale: string;
};

type SupplementShowcaseCardProps = {
  product: ShowcaseProductData;
};

export function SupplementShowcaseCard({
  product,
}: SupplementShowcaseCardProps) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative rounded-card border border-border-light bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium-hover focus-within:border-gold focus-within:shadow-premium-hover"
    >
      {product.slug ? (
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-20 rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        />
      ) : null}
      <div
        className={cn(
          "relative mb-4 flex h-[150px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br sm:h-[170px]",
          product.accent,
        )}
      >
        <span
          aria-hidden="true"
          className="absolute size-24 rounded-full bg-white/62 blur-2xl transition duration-500 group-hover:scale-125"
        />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={cn("relative h-[145px] w-[150px]", product.imageScale)}
        >
          <Image
            src={product.image || "/assets/hero-supplements.webp"}
            alt={`${product.name} supplement`}
            fill
            sizes="150px"
            className="object-contain drop-shadow-[0_20px_24px_rgba(6,57,33,0.2)] transition duration-500 group-hover:scale-110"
          />
        </motion.div>
      </div>

      <h3 className="relative z-10 font-heading text-base font-extrabold text-text-dark transition group-hover:text-primary">
        {product.name}
      </h3>
      <div className="relative z-10 mt-2 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{product.category}</p>
        <span className="inline-flex items-center gap-1 rounded-pill bg-gold/10 px-2.5 py-1 font-heading text-xs font-semibold text-text-dark">
          <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
          {product.rating}
        </span>
      </div>
    </motion.article>
  );
}
