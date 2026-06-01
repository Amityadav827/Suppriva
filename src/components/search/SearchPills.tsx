"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock3, Search, Sparkles } from "lucide-react";

export function SearchPills({
  title,
  items,
  variant = "popular",
}: {
  title: string;
  items: string[];
  variant?: "popular" | "recent";
}) {
  const Icon = variant === "popular" ? Sparkles : Clock3;

  return (
    <section className="bg-cream py-[72px] md:py-[92px] lg:py-[100px]">
      <div className="site-container">
        <h2 className="text-center font-heading text-2xl font-extrabold text-text-dark md:text-3xl">
          {title}
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {items.map((item) => (
            <motion.div
              key={item}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                href={`/search?q=${encodeURIComponent(item)}`}
                className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-white px-5 py-3 font-heading text-sm font-semibold text-text-dark shadow-[0_12px_34px_rgba(6,57,33,0.06)] transition duration-300 hover:border-gold/70 hover:bg-soft-green hover:text-primary hover:shadow-premium"
              >
                <Icon className="size-4 text-gold" aria-hidden="true" />
                {item}
              </Link>
            </motion.div>
          ))}
        </div>
        {variant === "recent" ? (
          <p className="mx-auto mt-5 flex max-w-xl items-center justify-center gap-2 text-center text-sm text-muted">
            <Search className="size-4 text-primary" aria-hidden="true" />
            Static recent searches for now, ready for user history later.
          </p>
        ) : null}
      </div>
    </section>
  );
}
