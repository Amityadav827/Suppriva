"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      action="/search"
      role="search"
      aria-label="Search Suppriva"
      suppressHydrationWarning
      className="mx-auto mt-8 flex max-w-4xl flex-col gap-3 rounded-[34px] border border-white/70 bg-white p-2.5 shadow-[0_24px_70px_rgba(6,57,33,0.16)] transition duration-300 focus-within:border-gold/70 focus-within:shadow-[0_28px_80px_rgba(217,165,32,0.22)] sm:flex-row sm:rounded-pill"
    >
      <div className="flex min-h-16 flex-1 items-center gap-3 px-4">
        <Search className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          suppressHydrationWarning
          placeholder="Search supplements, categories, guides..."
          className="min-w-0 flex-1 bg-transparent text-base text-text-dark outline-none placeholder:text-muted"
        />
      </div>
      <motion.button
        type="submit"
        suppressHydrationWarning
        whileHover={{ scale: 1.025, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.28 }}
        className="inline-flex min-h-16 items-center justify-center gap-2 rounded-pill bg-[linear-gradient(90deg,#063921,#0B5D3B,#0E7A4F)] px-8 font-heading text-sm font-semibold text-white shadow-[0_18px_46px_rgba(11,93,59,0.28)] transition duration-300 hover:shadow-[0_24px_60px_rgba(217,165,32,0.26)]"
      >
        Search
      </motion.button>
    </form>
  );
}
