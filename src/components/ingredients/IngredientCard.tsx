"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";
import type { Ingredient } from "@/lib/database/types";

export function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35 }}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border-light bg-white shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium-hover"
    >
      <Link href={`/ingredient/${ingredient.slug}`} className="flex h-full flex-col">
        <div className="relative flex h-[190px] items-center justify-center overflow-hidden bg-gradient-to-br from-soft-green to-gold/[0.14]">
          {ingredient.featured_image ? (
            <Image
              src={ingredient.featured_image}
              alt={ingredient.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <FlaskConical className="size-16 text-primary" aria-hidden="true" />
          )}
          {ingredient.is_featured ? (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-pill bg-white/92 px-3 py-1.5 font-heading text-xs font-semibold text-primary shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
              <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
              Featured
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">
            Ingredient Guide
          </p>
          <h3 className="mt-3 font-heading text-xl font-extrabold leading-tight text-text-dark">
            {ingredient.name}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-6 text-muted">
            {ingredient.short_description ||
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
