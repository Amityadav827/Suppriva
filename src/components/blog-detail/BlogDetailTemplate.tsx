import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ArticleContent } from "@/components/blog-detail/ArticleContent";
import { BlogHero } from "@/components/blog-detail/BlogHero";
import { AuthorReviewerCard } from "@/components/eeat/AuthorReviewerCard";
import { ReadingProgressBar } from "@/components/blog-detail/ReadingProgressBar";
import { RecommendedProducts } from "@/components/blog-detail/RecommendedProducts";
import { RelatedArticlesSlider } from "@/components/blog-detail/RelatedArticlesSlider";
import { TableOfContents } from "@/components/blog-detail/TableOfContents";
import { FAQAccordion } from "@/components/product-detail/FAQAccordion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { NewsletterSection } from "@/sections/NewsletterSection";
import type { BlogArticle } from "@/lib/blog-data";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { ProductCardData } from "@/components/product/ProductCard";

export function BlogDetailTemplate({
  article,
  relatedArticles = [],
  recommendedProducts = [],
}: {
  article: BlogArticle;
  relatedArticles?: (BlogPostCard & { slug: string })[];
  recommendedProducts?: ProductCardData[];
}) {
  return (
    <>
      <ReadingProgressBar />
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
              <Link href="/blogs" className="transition hover:text-primary">
                Blog
              </Link>
              <ChevronRight className="size-4" aria-hidden="true" />
              <span className="font-heading font-semibold text-text-dark">
                {article.title}
              </span>
            </nav>
            <BlogHero article={article} />
          </div>
        </section>

        <SectionWrapper id="editorial-review">
          <AuthorReviewerCard
            attribution={article.expertAttribution}
            heading="Written, reviewed, and updated for wellness clarity"
            description="Suppriva articles combine editorial research, expert review, and practical supplement context so readers can learn before they buy."
          />
        </SectionWrapper>

        <SectionWrapper id="article" tone="white">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
            <TableOfContents toc={article.toc} />
            <ArticleContent article={article} />
          </div>
        </SectionWrapper>

        <SectionWrapper id="recommended-products">
          <SectionTitle title="Recommended Supplements" />
          <div className="mt-12">
            <RecommendedProducts products={recommendedProducts} />
          </div>
        </SectionWrapper>

        <SectionWrapper id="faq" tone="white">
          <SectionTitle title="Frequently Asked Questions" />
          <div className="mt-12">
            <FAQAccordion faqs={article.faqs} />
          </div>
        </SectionWrapper>

        <SectionWrapper id="related-articles" tone="white">
          <SectionTitle title="Related Articles" />
          <RelatedArticlesSlider articles={relatedArticles} />
        </SectionWrapper>

        <NewsletterSection />
      </main>
    </>
  );
}
