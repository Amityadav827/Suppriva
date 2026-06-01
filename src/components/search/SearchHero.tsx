"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";

export function SearchHero({ initialQuery }: { initialQuery: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-cream pb-[72px] pt-8 md:pb-[92px] lg:pb-[100px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_22%,rgba(234,244,236,0.95)_0%,rgba(247,246,242,0)_31%),radial-gradient(circle_at_84%_30%,rgba(217,165,32,0.18)_0%,rgba(247,246,242,0)_28%)]"
      />
      <div className="site-container text-center">
        <motion.span
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-white px-4 py-2 font-heading text-sm font-semibold text-primary shadow-[0_14px_36px_rgba(6,57,33,0.08)]"
        >
          <Sparkles className="size-4 text-gold" aria-hidden="true" />
          Smart Wellness Search
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-extrabold leading-[1.1] text-text-dark md:text-5xl lg:text-6xl"
        >
          Find The Right Supplement For Your Goals
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted"
        >
          Search products, health guides, wellness articles and supplement
          categories.
        </motion.p>
        <SearchBar initialQuery={initialQuery} />
      </div>
    </section>
  );
}
