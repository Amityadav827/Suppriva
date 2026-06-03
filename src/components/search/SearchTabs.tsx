"use client";

import type { SearchResultType } from "@/lib/search-data";

export type SearchTab = "all" | SearchResultType;

const tabs: { label: string; value: SearchTab }[] = [
  { label: "All", value: "all" },
  { label: "Products", value: "product" },
  { label: "Categories", value: "category" },
  { label: "Articles", value: "article" },
  { label: "Ingredients", value: "ingredient" },
];

export function SearchTabs({
  active,
  onChange,
}: {
  active: SearchTab;
  onChange: (tab: SearchTab) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-[28px] border border-border-light bg-white p-2 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`shrink-0 rounded-pill px-5 py-3 font-heading text-sm font-semibold transition duration-300 ${
            active === tab.value
              ? "bg-primary text-white shadow-[0_12px_30px_rgba(11,93,59,0.18)] ring-1 ring-gold/35"
              : "text-muted hover:bg-soft-green hover:text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
