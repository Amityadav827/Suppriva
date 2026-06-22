"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { SitemapCollections, SitemapLinkItem } from "@/lib/seo/sitemap-data";

type HtmlSitemapClientProps = {
  collections: SitemapCollections;
};

type SectionConfig = {
  id: string;
  title: string;
  subtitle: string;
  items: SitemapLinkItem[];
};

function normalize(item: SitemapLinkItem) {
  return `${item.title} ${item.description} ${item.path}`.toLowerCase();
}

function formatUpdatedDate(value?: SitemapLinkItem["updatedAt"]) {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export function HtmlSitemapClient({ collections }: HtmlSitemapClientProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const sections = useMemo<SectionConfig[]>(
    () => [
      {
        id: "categories",
        title: "Categories",
        subtitle: "Wellness category hubs linked from the live categories table.",
        items: collections.categories,
      },
      {
        id: "ingredients",
        title: "Ingredients",
        subtitle: "Ingredient research pages for vitamins, herbs, minerals, and more.",
        items: collections.ingredients,
      },
      {
        id: "products",
        title: "Products",
        subtitle: "Published supplement product pages with live category routing.",
        items: collections.products,
      },
      {
        id: "blogs",
        title: "Blogs",
        subtitle: "Published wellness articles and supplement research guides.",
        items: collections.blogs,
      },
    ],
    [collections],
  );

  const filteredSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: normalizedQuery
            ? section.items.filter((item) => normalize(item).includes(normalizedQuery))
            : section.items,
        }))
        .filter((section) => section.items.length),
    [normalizedQuery, sections],
  );

  const totalResults = filteredSections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <main>
      <SectionWrapper id="html-sitemap" tone="white">
        <SectionTitle
          title="HTML Sitemap"
          subtitle="Search and navigate published categories, ingredients, products, and blog pages from one indexable internal-linking hub."
        />

        <div className="mx-auto mt-10 max-w-3xl rounded-[30px] border border-white/70 bg-white p-4 shadow-[0_26px_70px_rgba(15,23,42,0.08)] md:p-5">
          <label className="flex items-center gap-3 rounded-pill border border-border-light bg-cream/70 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <Search className="size-5 text-primary" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories, ingredients, products, or blog titles..."
              className="min-w-0 flex-1 bg-transparent text-base text-text-dark outline-none placeholder:text-muted"
            />
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>
              Showing{" "}
              <span className="font-heading font-bold text-text-dark">{totalResults}</span>{" "}
              page{totalResults === 1 ? "" : "s"}
              {normalizedQuery ? ` for "${query.trim()}"` : ""}.
            </span>
            <span className="inline-flex items-center gap-2 rounded-pill bg-soft-green px-3 py-1.5 text-primary">
              {filteredSections.length} section{filteredSections.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-2">
          {filteredSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="rounded-[30px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    Sitemap Section
                  </p>
                  <h2 className="mt-3 font-heading text-2xl font-extrabold text-text-dark">
                    {section.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                    {section.subtitle}
                  </p>
                </div>
                <span className="inline-flex rounded-pill bg-soft-green px-3 py-1.5 text-sm font-semibold text-primary">
                  {section.items.length} links
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {section.items.map((item) => {
                  const updatedDate = formatUpdatedDate(item.updatedAt);

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className="group flex items-start justify-between gap-4 rounded-[20px] border border-border-light bg-cream/60 px-4 py-4 transition hover:-translate-y-0.5 hover:border-gold/70 hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="font-heading text-base font-bold text-text-dark transition group-hover:text-primary">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                          <span>{item.path}</span>
                          {updatedDate ? <span>Updated {updatedDate}</span> : null}
                        </div>
                      </div>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-primary transition group-hover:translate-x-1" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </SectionWrapper>
    </main>
  );
}

