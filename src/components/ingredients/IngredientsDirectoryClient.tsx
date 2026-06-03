"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { IngredientCard } from "@/components/ingredients/IngredientCard";
import type { Ingredient } from "@/lib/database/types";

const PAGE_SIZE = 12;

export function IngredientsDirectoryClient({ ingredients }: { ingredients: Ingredient[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredIngredients = useMemo(() => {
    if (!normalizedQuery) {
      return ingredients;
    }

    return ingredients.filter((ingredient) =>
      [
        ingredient.name,
        ingredient.slug,
        ingredient.short_description ?? "",
        ingredient.full_description ?? "",
        ...ingredient.benefits,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [ingredients, normalizedQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredIngredients.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleIngredients = filteredIngredients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="mt-12">
      <div className="mx-auto flex min-h-14 max-w-2xl items-center gap-3 rounded-pill border border-border-light bg-white px-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
        <Search className="size-5 text-primary" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search ingredients, benefits, or dosage notes..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      {visibleIngredients.length ? (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {visibleIngredients.map((ingredient) => (
                <IngredientCard key={ingredient.id} ingredient={ingredient} />
              ))}
            </AnimatePresence>
          </motion.div>

          {totalPages > 1 ? (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`grid size-11 place-items-center rounded-full font-heading text-sm font-semibold transition ${
                    currentPage === pageNumber
                      ? "bg-primary text-white shadow-[0_12px_30px_rgba(11,93,59,0.18)]"
                      : "border border-border-light bg-white text-primary hover:border-gold/70"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-10 rounded-[28px] border border-border-light bg-white p-10 text-center shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
          <p className="font-heading text-xl font-extrabold text-text-dark">
            No ingredients found
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Try a broader ingredient name, benefit, or supplement goal.
          </p>
        </div>
      )}
    </div>
  );
}
