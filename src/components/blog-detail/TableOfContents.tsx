import type { BlogArticle } from "@/lib/blog-data";

export function TableOfContents({ toc }: { toc: BlogArticle["toc"] }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 rounded-[28px] border border-border-light bg-white/90 p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] backdrop-blur">
        <p className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
          In This Guide
        </p>
        <nav className="mt-5 grid gap-2" aria-label="Table of contents">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-2xl px-3 py-2 text-sm text-muted transition duration-300 hover:bg-soft-green hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
