import Image from "next/image";
import Link from "next/link";
import { ChevronRight, FlaskConical } from "lucide-react";
import { CategoryProductGrid } from "@/components/category-page/CategoryProductGrid";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { CategoryProduct } from "@/lib/category-data";
import type { Ingredient } from "@/lib/database/types";

export function IngredientDetailTemplate({
  ingredient,
  relatedProducts,
  relatedArticles,
}: {
  ingredient: Ingredient;
  relatedProducts: CategoryProduct[];
  relatedArticles: BlogPostCard[];
}) {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-cream pb-[72px] pt-8 md:pb-[92px] lg:pb-[100px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(234,244,236,0.95)_0%,rgba(247,246,242,0)_32%),radial-gradient(circle_at_86%_34%,rgba(217,165,32,0.15)_0%,rgba(247,246,242,0)_28%)]"
        />
        <div className="site-container">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link href="/" className="transition hover:text-primary">
              Home
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <Link href="/ingredients" className="transition hover:text-primary">
              Ingredients
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="font-heading font-semibold text-text-dark">
              {ingredient.name}
            </span>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div className="relative min-h-[360px] overflow-hidden rounded-[34px] border border-white/70 bg-white shadow-[0_28px_86px_rgba(15,23,42,0.08)]">
              {ingredient.featured_image ? (
                <Image
                  src={ingredient.featured_image}
                  alt={ingredient.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full min-h-[360px] place-items-center bg-gradient-to-br from-soft-green to-gold/[0.14]">
                  <FlaskConical className="size-24 text-primary" aria-hidden="true" />
                </div>
              )}
            </div>

            <div>
              <p className="font-heading text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Ingredient Library
              </p>
              <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-text-dark md:text-5xl">
                {ingredient.name}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                {ingredient.short_description ||
                  ingredient.meta_description ||
                  "A Suppriva ingredient profile for supplement research, product comparison, and wellness education."}
              </p>
              {ingredient.is_featured ? (
                <span className="mt-6 inline-flex rounded-pill bg-gold/12 px-4 py-2 font-heading text-sm font-semibold text-text-dark ring-1 ring-gold/25">
                  Featured ingredient
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <IngredientTextSection
        id="overview"
        title="Overview"
        content={ingredient.full_description || ingredient.short_description}
      />
      <IngredientListSection id="benefits" title="Potential Benefits" items={ingredient.benefits} />
      <IngredientListSection
        id="side-effects"
        title="Side Effects & Considerations"
        items={ingredient.side_effects}
        fallback="Review tolerance, medication use, and personal health history before adding this ingredient to a routine."
      />
      <IngredientTextSection id="dosage" title="Dosage Notes" content={ingredient.dosage} tone="white" />
      <IngredientTextSection
        id="science"
        title="Scientific Notes"
        content={ingredient.scientific_notes}
      />

      <SectionWrapper id="related-products" tone="white">
        <SectionTitle
          title="Related Products"
          subtitle="Published Suppriva products connected to this ingredient."
        />
        {relatedProducts.length ? (
          <CategoryProductGrid products={relatedProducts} />
        ) : (
          <EmptyPanel text="No products are linked to this ingredient yet." />
        )}
      </SectionWrapper>

      <SectionWrapper id="related-articles">
        <SectionTitle
          title="Related Articles"
          subtitle="Supplement guides and educational content from Suppriva."
        />
        {relatedArticles.length ? (
          <BlogGrid posts={relatedArticles} />
        ) : (
          <EmptyPanel text="Related articles will appear here as editorial coverage grows." />
        )}
      </SectionWrapper>
    </main>
  );
}

function IngredientTextSection({
  id,
  title,
  content,
  tone,
}: {
  id: string;
  title: string;
  content?: string | null;
  tone?: "cream" | "white";
}) {
  return (
    <SectionWrapper id={id} tone={tone}>
      <SectionTitle title={title} />
      <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-border-light bg-white p-6 text-base leading-8 text-muted shadow-[0_18px_52px_rgba(15,23,42,0.07)] md:p-8">
        {content || "This ingredient profile is ready for additional research notes."}
      </div>
    </SectionWrapper>
  );
}

function IngredientListSection({
  id,
  title,
  items,
  fallback,
}: {
  id: string;
  title: string;
  items: string[];
  fallback?: string;
}) {
  const visibleItems = items.length ? items : [fallback || "More ingredient details coming soon."];

  return (
    <SectionWrapper id={id} tone="white">
      <SectionTitle title={title} />
      <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
        {visibleItems.map((item) => (
          <div
            key={item}
            className="rounded-[24px] border border-border-light bg-white p-5 text-sm leading-6 text-muted shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
          >
            {item}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="mt-10 rounded-[28px] border border-border-light bg-white p-10 text-center text-sm text-muted shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
      {text}
    </div>
  );
}
