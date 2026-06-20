"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  ChevronRight,
  FlaskConical,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { IngredientCard } from "@/components/ingredients/IngredientCard";
import { FAQAccordion } from "@/components/product-detail/FAQAccordion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { CategoryProduct } from "@/lib/category-data";
import type { FAQItem, Ingredient } from "@/lib/database/types";

type IngredientsDirectoryClientProps = {
  ingredients: Ingredient[];
  featuredIngredients: Ingredient[];
  popularIngredients: Ingredient[];
  products: CategoryProduct[];
  articles: BlogPostCard[];
  directoryFaqs: FAQItem[];
  seoParagraphs: string[];
};

function normalizeSearchValue(ingredient: Ingredient) {
  return [
    ingredient.name,
    ingredient.slug,
    ingredient.scientific_name ?? "",
    ingredient.ingredient_category ?? "",
    ingredient.short_description ?? "",
    ingredient.full_description ?? "",
    ingredient.seo_description ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function categoryLabel(value?: string | null) {
  return value?.trim() || "General Wellness";
}

function groupByCategory(ingredients: Ingredient[]) {
  const map = new Map<string, Ingredient[]>();

  ingredients.forEach((ingredient) => {
    const key = categoryLabel(ingredient.ingredient_category);
    const items = map.get(key) ?? [];
    items.push(ingredient);
    map.set(key, items);
  });

  return Array.from(map.entries())
    .map(([label, items]) => ({
      label,
      ingredients: [...items].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => b.ingredients.length - a.ingredients.length || a.label.localeCompare(b.label));
}

function groupByLetter(ingredients: Ingredient[]) {
  const map = new Map<string, Ingredient[]>();

  ingredients.forEach((ingredient) => {
    const firstCharacter = ingredient.name.trim().charAt(0).toUpperCase();
    const letter = /^[A-Z]$/.test(firstCharacter) ? firstCharacter : "#";
    const items = map.get(letter) ?? [];
    items.push(ingredient);
    map.set(letter, items);
  });

  return Array.from(map.entries())
    .map(([letter, items]) => ({
      letter,
      ingredients: [...items].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.letter.localeCompare(b.letter));
}

function filterCollection<T extends { id: string }>(items: T[], ids: Set<string>) {
  return items.filter((item) => ids.has(item.id));
}

function averageRating(ingredients: Ingredient[]) {
  const ratings = ingredients
    .map((ingredient) => ingredient.rating)
    .filter((rating): rating is number => typeof rating === "number");

  if (!ratings.length) {
    return null;
  }

  return (ratings.reduce((sum, current) => sum + current, 0) / ratings.length).toFixed(1);
}

function scrollToLetter(letter: string) {
  const section = document.getElementById(`directory-letter-${letter}`);
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function IngredientsDirectoryClient({
  ingredients,
  featuredIngredients,
  popularIngredients,
  products,
  articles,
  directoryFaqs,
  seoParagraphs,
}: IngredientsDirectoryClientProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredIngredients = useMemo(() => {
    if (!normalizedQuery) {
      return ingredients;
    }

    return ingredients.filter((ingredient) => normalizeSearchValue(ingredient).includes(normalizedQuery));
  }, [ingredients, normalizedQuery]);

  const filteredIds = useMemo(() => new Set(filteredIngredients.map((ingredient) => ingredient.id)), [filteredIngredients]);
  const filteredFeatured = useMemo(
    () => filterCollection(featuredIngredients, filteredIds).slice(0, 6),
    [featuredIngredients, filteredIds],
  );
  const filteredPopular = useMemo(
    () => filterCollection(popularIngredients, filteredIds).slice(0, 6),
    [popularIngredients, filteredIds],
  );
  const groupedCategories = useMemo(() => groupByCategory(filteredIngredients), [filteredIngredients]);
  const groupedLetters = useMemo(() => groupByLetter(filteredIngredients), [filteredIngredients]);
  const ratingAverage = useMemo(() => averageRating(filteredIngredients), [filteredIngredients]);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-cream pb-16 pt-[72px] md:pb-24 md:pt-[96px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_18%,rgba(225,241,230,0.98)_0%,rgba(247,246,242,0)_32%),radial-gradient(circle_at_82%_24%,rgba(217,165,32,0.18)_0%,rgba(247,246,242,0)_24%)]"
        />
        <div className="site-container">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.1fr)_420px] xl:items-start">
            <div className="space-y-8">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 rounded-pill border border-primary/12 bg-white px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  Ingredient Directory
                </span>
                <div className="space-y-4">
                  <h1 className="max-w-4xl font-heading text-4xl font-extrabold leading-[1.02] text-text-dark md:text-6xl">
                    Premium Ingredients Directory for smarter supplement research
                  </h1>
                  <p className="max-w-3xl text-lg leading-8 text-muted">
                    Explore {filteredIngredients.length} live Suppriva ingredient records across{" "}
                    {groupedCategories.length} categories with scientific names, category context,
                    safety notes, FAQs, product relationships, and editorial connections.
                  </p>
                </div>
              </div>

              <div className="max-w-3xl rounded-[30px] border border-white/70 bg-white p-4 shadow-[0_26px_70px_rgba(15,23,42,0.08)] md:p-5">
                <label className="flex items-center gap-3 rounded-pill border border-border-light bg-cream/70 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                  <Search className="size-5 text-primary" aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by ingredient name, scientific name, or category..."
                    className="min-w-0 flex-1 bg-transparent text-base text-text-dark outline-none placeholder:text-muted"
                  />
                </label>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                  <span>
                    Showing{" "}
                    <span className="font-heading font-bold text-text-dark">
                      {filteredIngredients.length}
                    </span>{" "}
                    ingredient{filteredIngredients.length === 1 ? "" : "s"}
                    {normalizedQuery ? ` for "${query.trim()}"` : ""}.
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-pill bg-soft-green px-3 py-1.5 text-primary">
                    {groupedCategories.length} categor{groupedCategories.length === 1 ? "y" : "ies"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {groupedCategories.slice(0, 5).map((group) => (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() => {
                      document
                        .getElementById(`ingredient-category-${group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-4 py-2 text-sm font-semibold text-text-dark shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-gold/70 hover:text-primary"
                  >
                    {group.label}
                    <span className="rounded-full bg-soft-green px-2 py-0.5 text-xs text-primary">
                      {group.ingredients.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <HeroMetricCard
                label="Ingredient Profiles"
                value={filteredIngredients.length.toString()}
                detail="Live database-driven records"
              />
              <HeroMetricCard
                label="Featured Profiles"
                value={filteredFeatured.length.toString()}
                detail="Priority educational coverage"
              />
              <HeroMetricCard
                label="Directory Categories"
                value={groupedCategories.length.toString()}
                detail="Grouped by ingredient category"
              />
              <HeroMetricCard
                label="Average Rating"
                value={ratingAverage ? `${ratingAverage}/5` : "N/A"}
                detail="Calculated from visible ingredients"
              />
            </div>
          </div>
        </div>
      </section>

      {filteredFeatured.length ? (
        <SectionWrapper id="featured-ingredients" tone="white">
          <SectionTitle
            title="Featured Ingredients"
            subtitle="High-priority ingredient profiles surfaced for readers comparing formulas, wellness goals, and evidence-driven supplement research."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredFeatured.map((ingredient) => (
              <IngredientCard key={ingredient.id} ingredient={ingredient} />
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      {filteredPopular.length ? (
        <SectionWrapper id="popular-ingredients">
          <SectionTitle
            title="Popular Ingredients"
            subtitle="Popular here is based on the strongest visible mix of ingredient ratings, freshness, and editorial importance from the live library."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPopular.map((ingredient) => (
              <IngredientCard key={ingredient.id} ingredient={ingredient} />
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      <SectionWrapper id="ingredient-categories" tone="white">
        <SectionTitle
          title="Ingredient Categories"
          subtitle="Browse the library by ingredient category to jump into clusters such as adaptogens, vitamins, minerals, and other wellness-focused groups."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {groupedCategories.map((group) => {
            const anchor = `ingredient-category-${group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

            return (
              <article
                key={group.label}
                id={anchor}
                className="rounded-[30px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      Category Group
                    </p>
                    <h3 className="mt-3 font-heading text-2xl font-extrabold text-text-dark">
                      {group.label}
                    </h3>
                  </div>
                  <span className="inline-flex rounded-pill bg-soft-green px-3 py-1.5 text-sm font-semibold text-primary">
                    {group.ingredients.length} items
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted">
                  Explore ingredient records in this category and jump straight to their premium detail pages.
                </p>
                <div className="mt-6 space-y-3">
                  {group.ingredients.slice(0, 4).map((ingredient) => (
                    <Link
                      key={ingredient.id}
                      href={`/ingredient/${ingredient.slug}`}
                      className="flex items-center justify-between gap-4 rounded-[20px] border border-border-light bg-cream/70 px-4 py-3 text-sm font-semibold text-text-dark transition hover:border-gold/70 hover:text-primary"
                    >
                      <span className="min-w-0">
                        <span className="block truncate">{ingredient.name}</span>
                        {ingredient.scientific_name ? (
                          <span className="block truncate text-xs font-normal italic text-muted">
                            {ingredient.scientific_name}
                          </span>
                        ) : null}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper id="a-z-directory">
        <SectionTitle
          title="A-Z Ingredient Directory"
          subtitle="Jump directly to ingredients by first letter and scan the directory with instant filtering."
        />
        <div className="mt-12 rounded-[30px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
          <div className="flex flex-wrap gap-2">
            {groupedLetters.map((group) => (
              <button
                key={group.letter}
                type="button"
                onClick={() => scrollToLetter(group.letter)}
                className="inline-flex min-w-11 items-center justify-center rounded-full border border-border-light bg-cream/80 px-4 py-2 text-sm font-bold text-text-dark transition hover:border-gold/70 hover:bg-white hover:text-primary"
              >
                {group.letter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 space-y-14">
          {groupedLetters.map((group) => (
            <div key={group.letter} id={`directory-letter-${group.letter}`} className="scroll-mt-28">
              <div className="mb-6 flex items-center gap-4">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-xl font-heading font-extrabold text-white shadow-[0_16px_40px_rgba(11,93,59,0.18)]">
                  {group.letter}
                </span>
                <div>
                  <h3 className="font-heading text-3xl font-extrabold text-text-dark">
                    {group.letter}
                  </h3>
                  <p className="text-sm text-muted">
                    {group.ingredients.length} ingredient{group.ingredients.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {group.ingredients.map((ingredient) => (
                  <IngredientCard key={ingredient.id} ingredient={ingredient} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper id="directory-connections" tone="white">
        <SectionTitle
          title="Internal Research Paths"
          subtitle="Move from ingredients into live product records, editorial coverage, and deeper supplement discovery flows without leaving the Suppriva ecosystem."
        />
        <div className="mt-12 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-[30px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-soft-green text-primary">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-heading text-2xl font-extrabold text-text-dark">
                  Linked Products
                </h3>
                <p className="text-sm text-muted">
                  Published product pages already connected to the live site.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <InternalProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                <BookOpenText className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-heading text-2xl font-extrabold text-text-dark">
                  Related Articles
                </h3>
                <p className="text-sm text-muted">
                  Blog content that deepens ingredient research and category understanding.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {articles.map((article) => (
                <InternalArticleCard key={article.slug || article.title} article={article} />
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="ingredients-directory-seo">
        <SectionTitle
          title="Ingredient Research Hub"
          subtitle="Search-friendly editorial content generated from the live ingredient library and designed to support premium supplement discovery."
        />
        <div className="mx-auto mt-12 grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.1fr)_320px]">
          <div className="rounded-[32px] border border-border-light bg-white p-8 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
            <div className="space-y-5">
              {seoParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-8 text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
              <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Top Categories
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {groupedCategories.slice(0, 8).map((group) => (
                  <span
                    key={group.label}
                    className="rounded-pill border border-border-light bg-cream/80 px-3 py-2 text-sm font-semibold text-text-dark"
                  >
                    {group.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
              <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Research Shortcuts
              </p>
              <div className="mt-4 space-y-3">
                <Link
                  href="/products"
                  className="flex items-center justify-between rounded-[18px] border border-border-light px-4 py-3 text-sm font-semibold text-text-dark transition hover:border-gold/70 hover:text-primary"
                >
                  Browse products
                  <ArrowRight className="size-4 text-primary" aria-hidden="true" />
                </Link>
                <Link
                  href="/blogs"
                  className="flex items-center justify-between rounded-[18px] border border-border-light px-4 py-3 text-sm font-semibold text-text-dark transition hover:border-gold/70 hover:text-primary"
                >
                  Read blog guides
                  <ArrowRight className="size-4 text-primary" aria-hidden="true" />
                </Link>
                <Link
                  href="/search"
                  className="flex items-center justify-between rounded-[18px] border border-border-light px-4 py-3 text-sm font-semibold text-text-dark transition hover:border-gold/70 hover:text-primary"
                >
                  Search everything
                  <ArrowRight className="size-4 text-primary" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </SectionWrapper>

      <SectionWrapper id="ingredients-directory-faq" tone="white">
        <SectionTitle
          title="Ingredients Directory FAQ"
          subtitle="Answers generated for the live directory so the page remains schema-ready and useful for visitors comparing ingredients."
        />
        <div className="mt-12">
          <FAQAccordion faqs={directoryFaqs} />
        </div>
      </SectionWrapper>
    </main>
  );
}

function HeroMetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{label}</p>
      <p className="mt-3 font-heading text-3xl font-extrabold text-text-dark">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

function InternalProductCard({ product }: { product: CategoryProduct }) {
  return (
    <Link
      href={product.href || `/product/${product.slug}`}
      className="group flex items-center gap-4 rounded-[24px] border border-border-light bg-cream/60 p-4 transition hover:-translate-y-0.5 hover:border-gold/70 hover:bg-white"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-[20px] bg-soft-green">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <FlaskConical className="size-7 text-primary" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
          {product.rating}
        </div>
        <h4 className="mt-2 truncate font-heading text-lg font-extrabold text-text-dark">
          {product.name}
        </h4>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {product.category}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{product.description}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-1" />
    </Link>
  );
}

function InternalArticleCard({ article }: { article: BlogPostCard }) {
  return (
    <Link
      href={article.slug ? `/blog/${article.slug}` : "/blogs"}
      className="group block rounded-[24px] border border-border-light bg-cream/60 p-4 transition hover:-translate-y-0.5 hover:border-gold/70 hover:bg-white"
    >
      <div className="flex items-start gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-[20px] bg-soft-green">
          <Image
            src={article.image}
            alt={article.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {article.category} • {article.readingTime}
          </p>
          <h4 className="mt-2 line-clamp-2 font-heading text-lg font-extrabold text-text-dark">
            {article.title}
          </h4>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{article.description}</p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
