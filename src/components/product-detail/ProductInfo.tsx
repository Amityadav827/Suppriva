"use client";

import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, Star } from "lucide-react";
import { AffiliateCtaButton } from "@/components/product-detail/AffiliateCtaButton";
import type { ProductDetail } from "@/lib/product-data";

export function ProductInfo({ product }: { product: ProductDetail }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
      className="lg:pl-2"
    >
      <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {product.category}
      </p>
      <h1 className="mt-4 font-heading text-4xl font-extrabold leading-[1.1] text-text-dark md:text-5xl lg:text-6xl">
        {product.name}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold/24 bg-gold/10 px-3 py-1.5 font-heading text-sm font-semibold text-text-dark">
          <Star className="size-4 fill-gold text-gold" aria-hidden="true" />
          {product.rating}
        </span>
        <span className="text-sm text-muted">Premium affiliate pick</span>
      </div>

      <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
        {product.description}
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {product.bullets.map((bullet) => (
          <div
            key={bullet}
            className="flex items-center gap-3 rounded-2xl border border-border-light bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
          >
            <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="font-heading text-sm font-semibold text-text-dark">
              {bullet}
            </span>
          </div>
        ))}
      </div>

      <AffiliateCtaButton
        productId={product.productId}
        productSlug={product.slug}
        affiliateUrl={product.affiliateUrl}
      />
      <p className="mt-3 max-w-xl text-xs leading-5 text-muted">
        Affiliate disclosure: Suppriva may earn a commission when you visit or
        purchase through official partner links.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {product.trustBadges.map((badge) => (
          <div
            key={badge}
            className="rounded-2xl border border-border-light bg-white p-3 text-center shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
          >
            <BadgeCheck className="mx-auto size-5 text-gold" aria-hidden="true" />
            <p className="mt-2 font-heading text-xs font-semibold text-text-dark">
              {badge}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
