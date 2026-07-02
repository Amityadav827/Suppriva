"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import type { Ingredient } from "@/lib/database/types";

export function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const category = ingredient.ingredient_category?.trim() || "General Wellness";

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35 }}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border-light bg-white shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium-hover"
    >
      <Link href={`/ingredient/${ingredient.slug}`} className="flex h-full flex-col">
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {ingredient.is_featured ? (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary shadow-[0_10px_24px_rgba(6,57,33,0.06)]">
                <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
                Featured
              </span>
            ) : null}
            <span className="inline-flex max-w-full items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 text-xs font-semibold text-text-dark">
              <span className="truncate">{category}</span>
              {ingredient.rating ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-primary">
                  <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
                  {ingredient.rating.toFixed(1)}
                </span>
              ) : null}
            </span>
          </div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">
            Ingredient Profile
          </p>
          <h3 className="mt-3 font-heading text-xl font-extrabold leading-tight text-text-dark">
            {ingredient.name}
          </h3>
          {ingredient.scientific_name ? (
            <p className="mt-2 text-sm italic text-primary">{ingredient.scientific_name}</p>
          ) : null}
          <p className="mt-3 flex-1 text-sm leading-6 text-muted">
            {ingredient.short_description ||
              ingredient.seo_description ||
              ingredient.meta_description ||
              "Research this supplement ingredient, benefits, dosage notes, and product usage."}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary">
            Read ingredient profile
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
