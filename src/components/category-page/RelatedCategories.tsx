"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { GridWrapper } from "@/components/layout/GridWrapper";

type RelatedCategory = { label: string; slug: string } | string;

function normalizeCategory(category: RelatedCategory) {
  if (typeof category === "string") {
    return {
      label: category,
      slug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    };
  }

  return category;
}

export function RelatedCategories({ categories }: { categories: RelatedCategory[] }) {
  return (
    <GridWrapper className="mt-12 flex flex-wrap justify-center gap-3">
      {categories.map((category) => {
        const item = normalizeCategory(category);

        return (
        <motion.div
          key={item.slug}
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <Link
          href={`/category/${item.slug}`}
          className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-soft-green px-5 py-3 font-heading text-sm font-semibold text-text-dark shadow-[0_12px_34px_rgba(6,57,33,0.06)] transition duration-300 hover:border-gold/60 hover:bg-white hover:text-primary hover:shadow-premium"
        >
          <Leaf className="size-4 text-primary" aria-hidden="true" />
          {item.label}
          </Link>
        </motion.div>
        );
      })}
    </GridWrapper>
  );
}
