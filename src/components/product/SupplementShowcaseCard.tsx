"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ShowcaseProductData = {
  slug?: string;
  href?: string;
  name: string;
  benefit: string;
  category: string;
  status: string;
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
  const badgeStyles: Record<string, string> = {
    FEATURED: "bg-soft-green text-primary border border-primary/10",
    POPULAR: "bg-primary/10 text-primary border border-primary/14",
    TRENDING: "bg-gold/10 text-text-dark border border-gold/20",
    UPDATED: "bg-[#E6F5EC] text-[#0B5D3B] border border-[#B9E1C7]",
  };
  const badgeStyle =
    badgeStyles[product.status.toUpperCase()] ??
    "bg-soft-green text-primary border border-primary/10";

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative rounded-[20px] border border-border-light bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.07)] transition duration-300 hover:border-primary/38 hover:shadow-premium-hover focus-within:border-gold focus-within:shadow-premium-hover"
    >
      {product.href || product.slug ? (
        <Link
          href={product.href || `/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-20 rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        />
      ) : null}
      <div
        className={cn(
          "relative mb-4 flex h-[150px] items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br sm:h-[170px]",
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
            className="object-contain drop-shadow-[0_20px_24px_rgba(6,57,33,0.2)] transition duration-500 group-hover:scale-[1.03]"
          />
        </motion.div>
      </div>

      <h3 className="relative z-10 font-heading text-base font-extrabold text-text-dark transition group-hover:text-primary">
        {product.name}
      </h3>
      <p
        className="relative z-10 mt-2 truncate text-sm leading-6 text-muted"
        title={product.benefit}
      >
        {product.benefit}
      </p>
      <div className="relative z-10 mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{product.category}</p>
        <span
          className={cn(
            "inline-flex rounded-pill px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.08em]",
            badgeStyle,
          )}
        >
          {product.status}
        </span>
      </div>
    </motion.article>
  );
}
