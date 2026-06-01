"use client";

import { useMemo, useState } from "react";
import { GridWrapper } from "@/components/layout/GridWrapper";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SearchTabs, type SearchTab } from "@/components/search/SearchTabs";
import { EmptySearchState } from "@/components/search/EmptySearchState";
import type { SearchResult, SearchResultType } from "@/lib/search-data";

function filterSearchResults(
  results: SearchResult[],
  query: string,
  activeType: "all" | SearchResultType,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return results.filter((result) => {
    const matchesType = activeType === "all" || result.type === activeType;
    const haystack = `${result.title} ${result.category} ${result.description}`.toLowerCase();
    const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

    return matchesType && matchesQuery;
  });
}

export function SearchResults({
  query,
  results: initialResults,
}: {
  query: string;
  results: SearchResult[];
}) {
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const results = useMemo(
    () => filterSearchResults(initialResults, query, activeTab),
    [initialResults, query, activeTab],
  );

  return (
    <section className="bg-white py-[72px] md:py-[92px] lg:py-[100px]">
      <div className="site-container">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-text-dark md:text-3xl">
              Search Results
            </h2>
            <p className="mt-2 text-sm text-muted">
              {results.length} premium result{results.length === 1 ? "" : "s"} found
              {query ? ` for "${query}"` : ""}
            </p>
          </div>
          <SearchTabs active={activeTab} onChange={setActiveTab} />
        </div>

        {results.length > 0 ? (
          <GridWrapper className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </GridWrapper>
        ) : (
          <EmptySearchState />
        )}
      </div>
    </section>
  );
}
