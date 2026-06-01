"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  return (
    <form
      action="/search"
      role="search"
      aria-label="Search supplements"
      suppressHydrationWarning
      className={cn(
        "flex h-14 w-full items-center rounded-pill bg-white p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.14)] ring-1 ring-white/10",
        className,
      )}
    >
      <Search className="ml-4 size-5 shrink-0 text-muted" aria-hidden="true" />
      <input
        type="search"
        name="q"
        autoComplete="off"
        suppressHydrationWarning
        placeholder="Search supplements, vitamins, wellness..."
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-text-dark outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        aria-label="Submit search"
        suppressHydrationWarning
        className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-dark-green shadow-gold transition duration-300 hover:scale-105 hover:bg-[#e4b331] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>
    </form>
  );
}
