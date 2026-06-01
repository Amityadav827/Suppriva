"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";

export function EmptySearchState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto mt-12 max-w-2xl rounded-[32px] border border-border-light bg-[linear-gradient(135deg,#FFFFFF,#F7F6F2)] p-8 text-center shadow-premium"
    >
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-soft-green text-primary">
        <SearchX className="size-9" aria-hidden="true" />
      </div>
      <h3 className="mt-6 font-heading text-2xl font-extrabold text-text-dark">
        No Results Found
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
        Try another search term or explore our most popular supplement
        categories.
      </p>
      <Link
        href="/search"
        className="mt-6 inline-flex rounded-pill bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition duration-300 hover:bg-button-hover"
      >
        Reset Search
      </Link>
    </motion.div>
  );
}
