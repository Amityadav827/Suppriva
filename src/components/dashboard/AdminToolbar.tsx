"use client";

import { Plus, Search, SlidersHorizontal } from "lucide-react";

export function AdminToolbar({
  buttonLabel,
  searchPlaceholder = "Search...",
}: {
  buttonLabel: string;
  searchPlaceholder?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
        <Search className="size-4 text-primary" aria-hidden="true" />
        <input
          placeholder={searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </button>
        <button
          type="button"
          className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
        >
          <Plus className="size-4" />
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
