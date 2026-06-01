import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryHero } from "@/components/category-page/CategoryHero";
import { CategoryProductGrid } from "@/components/category-page/CategoryProductGrid";
import { CategorySEOContent } from "@/components/category-page/CategorySEOContent";
import { CategoryStats } from "@/components/category-page/CategoryStats";
import { FeaturedProductsSlider } from "@/components/category-page/FeaturedProductsSlider";
import { FilterBar } from "@/components/category-page/FilterBar";
import { RelatedCategories } from "@/components/category-page/RelatedCategories";
import { FAQAccordion } from "@/components/product-detail/FAQAccordion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { CategoryDetail } from "@/lib/category-data";

export function CategoryDetailTemplate({
  category,
}: {
  category: CategoryDetail;
}) {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-cream pb-[72px] pt-8 md:pb-[92px] lg:pb-[100px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_22%,rgba(234,244,236,0.9)_0%,rgba(247,246,242,0)_31%),radial-gradient(circle_at_84%_30%,rgba(217,165,32,0.16)_0%,rgba(247,246,242,0)_28%)]"
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
            <Link href="/categories" className="transition hover:text-primary">
              Categories
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="font-heading font-semibold text-text-dark">
              {category.title.replace(" Supplements", "")}
            </span>
          </nav>
          <CategoryHero category={category} />
          <CategoryStats stats={category.stats} />
        </div>
      </section>

      <SectionWrapper id="products" tone="white">
        <SectionTitle title={`${category.title}: Top Picks`} />
        <div className="mt-10">
          <FilterBar />
          <CategoryProductGrid products={category.products} />
        </div>
      </SectionWrapper>

      <SectionWrapper id="featured-products">
        <SectionTitle title="Featured Products" />
        <FeaturedProductsSlider products={category.featured} />
      </SectionWrapper>

      <SectionWrapper id="related-categories" tone="white">
        <SectionTitle title="Related Categories" />
        <RelatedCategories categories={category.relatedCategories} />
      </SectionWrapper>

      <SectionWrapper id="category-guide">
        <CategorySEOContent
          title={category.seoTitle}
          paragraphs={category.seoParagraphs}
          facts={category.facts}
        />
      </SectionWrapper>

      <SectionWrapper id="category-faq" tone="white">
        <SectionTitle title="Category FAQ" />
        <div className="mt-12">
          <FAQAccordion faqs={category.faqs} />
        </div>
      </SectionWrapper>
    </main>
  );
}
