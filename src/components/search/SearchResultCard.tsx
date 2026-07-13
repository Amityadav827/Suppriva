"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, FolderOpen, Star } from "lucide-react";
import type { SearchResult } from "@/lib/search-data";

export function SearchResultCard({ result }: { result: SearchResult }) {
  const isCategory = result.type === "category";
  const isIngredient = result.type === "ingredient";

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35 }}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border-light bg-white shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium-hover"
    >
      {!isIngredient ? (
        <div className="relative flex h-[210px] items-center justify-center overflow-hidden bg-gradient-to-br from-soft-green to-gold/[0.14]">
          {result.image ? (
            <Image
              src={result.image}
              alt={result.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className={`${result.type === "product" ? "object-contain p-5" : "object-cover"} transition duration-700 group-hover:scale-110`}
            />
          ) : (
            <FolderOpen className="size-16 text-primary" aria-hidden="true" />
          )}
          <div className="absolute inset-0 bg-dark-green/0 transition duration-500 group-hover:bg-dark-green/10" />
        </div>
      ) : null}

      <div className={`flex flex-1 flex-col ${isIngredient ? "p-7 md:p-8" : "p-6"}`}>
        <span className="w-fit rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary">
          {result.category}
        </span>
        <h3 className="mt-4 font-heading text-xl font-extrabold leading-tight text-text-dark">
          {result.title}
        </h3>
        {isIngredient && result.scientificName ? (
          <p className="mt-2 text-sm italic text-primary">{result.scientificName}</p>
        ) : null}
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-muted">
          {result.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          {result.rating ? (
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold/24 bg-gold/10 px-3 py-1.5 font-heading text-sm font-semibold text-text-dark">
              <Star className="size-4 fill-gold text-gold" aria-hidden="true" />
              {result.rating}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-border-light bg-white px-3 py-1.5 text-sm text-muted">
              <Clock3 className="size-4 text-gold" aria-hidden="true" />
              {result.readingTime ?? (isCategory ? "Explore" : "Guide")}
            </span>
          )}
          <Link
            href={result.href}
            className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 font-heading text-xs font-semibold text-white transition duration-300 hover:bg-button-hover"
          >
            {isIngredient ? "Read More" : "Open"}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
