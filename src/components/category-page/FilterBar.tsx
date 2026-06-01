"use client";

const filters = ["Most Popular", "Highest Rated", "Newest", "Featured"];

export function FilterBar() {
  return (
    <div className="sticky top-[90px] z-30 rounded-[28px] border border-border-light bg-white/88 p-3 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="px-2 font-heading text-sm font-extrabold text-text-dark">
          Sort By
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {filters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`shrink-0 rounded-pill border px-4 py-2.5 font-heading text-sm font-semibold transition duration-300 ${
                index === 0
                  ? "border-primary bg-primary text-white shadow-[0_12px_30px_rgba(11,93,59,0.18)]"
                  : "border-border-light bg-white text-muted hover:border-gold/70 hover:text-primary"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
