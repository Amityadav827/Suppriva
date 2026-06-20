"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Beaker,
  BookOpenText,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Leaf,
  MoonStar,
  ScanHeart,
  Sparkle,
  PackageCheck,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Dumbbell,
} from "lucide-react";
import { motion } from "framer-motion";
import { ExpertChatWidget } from "@/components/product/ExpertChatWidget";
import { FadeIn } from "@/components/ui/FadeIn";
import { AffiliateCtaButton } from "@/components/product-detail/AffiliateCtaButton";
import { FAQAccordion } from "@/components/product-detail/FAQAccordion";
import { ProsCons } from "@/components/product-detail/ProsCons";
import { RelatedProductsSlider } from "@/components/product-detail/RelatedProductsSlider";
import {
  IngredientSectionNav,
  type IngredientSectionLink,
} from "@/components/ingredients/IngredientSectionNav";
import type { ProductDetail } from "@/lib/product-data";

function splitIntoColumns<T>(items: T[], columns: number) {
  return Array.from({ length: columns }, (_, columnIndex) =>
    items.filter((_, itemIndex) => itemIndex % columns === columnIndex),
  ).filter((column) => column.length);
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function benefitIcon(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("metabolism") || normalized.includes("energy")) {
    return Sparkles;
  }

  if (normalized.includes("heart") || normalized.includes("circulation")) {
    return HeartPulse;
  }

  if (normalized.includes("detox") || normalized.includes("cleanse")) {
    return FlaskConical;
  }

  if (normalized.includes("weight") || normalized.includes("support")) {
    return ShieldCheck;
  }

  return Leaf;
}

function healthNeedIcon(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("women")) {
    return HeartPulse;
  }

  if (normalized.includes("men")) {
    return Dumbbell;
  }

  if (normalized.includes("hair")) {
    return Sparkle;
  }

  if (normalized.includes("weight")) {
    return ScanHeart;
  }

  if (normalized.includes("sleep")) {
    return MoonStar;
  }

  if (normalized.includes("heart")) {
    return HeartPulse;
  }

  return Leaf;
}

function sectionCardClasses(tone: "white" | "cream" = "white") {
  return tone === "white"
    ? "rounded-[30px] border border-black/5 bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] md:p-8"
    : "rounded-[30px] border border-black/5 bg-cream/70 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.05)] md:p-8";
}

export function ProductDetailTemplate({ product }: { product: ProductDetail }) {
  const faqColumns = splitIntoColumns(product.faqs, 2);
  const heroImage =
    product.image || product.gallery?.[0] || "/assets/hero-supplements.webp";
  const whatIsParagraphs = [
    product.description,
    `${product.name} is positioned in the ${product.category.toLowerCase()} category and is typically considered by readers comparing ingredient depth, benefit focus, and day-to-day usability.`,
    `Consumers usually evaluate ${product.name} around goals like ${product.bestFor.toLowerCase()} while reviewing ingredient transparency and overall formula support.`,
  ].filter(hasText) as string[];

  const sections: IngredientSectionLink[] = [
    { id: "hero", label: "Overview" },
    { id: "what-is-product", label: `What Is ${product.name}?` },
    ...(product.standoutPoints.length
      ? [{ id: "why-it-stands-out", label: "Why It Stands Out" }]
      : []),
    ...(product.howItWorks.length ? [{ id: "how-it-works", label: "How It Works" }] : []),
    ...(product.benefits.length ? [{ id: "benefits", label: "Key Benefits" }] : []),
    ...(product.ingredients.length ? [{ id: "ingredients", label: "Ingredient Breakdown" }] : []),
    ...(product.whoItsBestFor.length
      ? [{ id: "who-is-it-best-for", label: "Who Is It Best For" }]
      : []),
    ...(product.safety.sideEffects.length ||
    product.safety.whoShouldAvoid.length ||
    product.safety.drugInteractions.length ||
    product.safety.precautions.length
      ? [{ id: "safety", label: "Safety Information" }]
      : []),
    ...(product.pros.length || product.cons.length ? [{ id: "pros-cons", label: "Pros & Cons" }] : []),
    ...(product.faqs.length ? [{ id: "faq", label: "FAQ" }] : []),
    ...(hasText(product.verdict.summary) ? [{ id: "verdict", label: "SuppRiva Verdict" }] : []),
    { id: "where-to-buy", label: "Where To Buy" },
    ...(product.relatedIngredients.length
      ? [{ id: "related-ingredients", label: "Related Ingredients" }]
      : []),
    ...(product.relatedArticles.length ? [{ id: "learn-more", label: "Learn More" }] : []),
    ...(product.comparisonProducts.length
      ? [{ id: "compare-alternatives", label: "Compare Alternatives" }]
      : []),
    ...(product.relatedProducts?.length
      ? [{ id: "related-products", label: "Related Products" }]
      : []),
    ...(product.healthNeeds.length
      ? [{ id: "explore-health-needs", label: "Explore By Health Needs" }]
      : []),
  ];

  const sidebarFacts = [
    { label: "Category", value: product.category, icon: ClipboardList },
    { label: "Best For", value: product.bestFor, icon: ShieldCheck },
    { label: "Ingredient Count", value: String(product.ingredients.length), icon: Beaker },
    { label: "Rating", value: `${product.rating} / 5`, icon: Star },
    {
      label: "Related Articles",
      value: String(product.relatedArticles.length),
      icon: BookOpenText,
    },
    {
      label: "Related Ingredients",
      value: String(product.relatedIngredients.length),
      icon: Leaf,
    },
  ];

  return (
    <main className="relative overflow-x-clip bg-cream">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(234,244,236,0.95)_0%,rgba(247,246,242,0)_32%),radial-gradient(circle_at_86%_34%,rgba(217,165,32,0.15)_0%,rgba(247,246,242,0)_28%)]"
      />

      <div className="site-container py-8 md:py-10 lg:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted"
        >
          <Link href="/" className="transition hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-4" aria-hidden="true" />
          <Link href="/products" className="transition hover:text-primary">
            Supplements
          </Link>
          {product.categorySlug ? (
            <>
              <ChevronRight className="size-4" aria-hidden="true" />
              <Link
                href={`/category/${product.categorySlug}`}
                className="transition hover:text-primary"
              >
                {product.category}
              </Link>
            </>
          ) : null}
          <ChevronRight className="size-4" aria-hidden="true" />
          <span className="font-heading font-semibold text-text-dark">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0 space-y-8 md:space-y-10">
            <section
              id="hero"
              className={sectionCardClasses()}
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:items-start">
                <div className="min-w-0 space-y-4">
                  <SingleProductImageCard
                    productName={product.name}
                    image={heroImage}
                  />
                  <FadeIn className="mx-auto w-full max-w-[520px] px-2 pt-1 md:px-3">
                    <div className="space-y-3 text-left">
                      <p className="text-center font-heading text-sm font-bold text-text-dark">
                        Go to official page
                      </p>
                      <div className="space-y-2.5">
                        {[
                          "Fast access to official ordering",
                          "Quality and safety details are easy to review",
                          "Checkout is handled on the official product page",
                        ].map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Check className="size-4" aria-hidden="true" />
                            </span>
                            <p className="text-sm leading-6 text-muted">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                </div>

                <div className="min-w-0 space-y-6">
                  <FadeIn className="space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={
                          product.categorySlug
                            ? `/category/${product.categorySlug}`
                            : "/categories"
                        }
                        className="inline-flex items-center gap-2 rounded-pill border border-[#8B5CF6]/18 bg-[#8B5CF6]/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9] transition hover:bg-[#8B5CF6]/14"
                      >
                        {product.category}
                      </Link>
                    </div>

                    <div className="space-y-3">
                      <h1 className="font-heading text-5xl font-extrabold leading-[0.98] text-text-dark md:text-6xl xl:text-[4.15rem]">
                        {product.name}
                      </h1>
                      <p className="max-w-3xl text-[1rem] leading-7 text-primary">
                        {product.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-y border-black/6 py-4">
                      <div className="inline-flex items-center gap-2">
                        <span className="flex items-center gap-1 text-gold">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={`star-${index + 1}`}
                              className={`size-4 ${index < Math.round(product.ratingValue) ? "fill-gold text-gold" : "text-gold/35"}`}
                            />
                          ))}
                        </span>
                        <span className="font-heading text-base font-bold text-text-dark">
                          {product.rating}
                        </span>
                        <span className="text-sm text-muted">
                          out of 5 ({product.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <p className="max-w-3xl text-lg leading-8 text-muted">
                      {product.description}
                    </p>
                  </FadeIn>

                  <FadeIn className="grid gap-3 md:grid-cols-2">
                    {product.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="flex items-start gap-3 rounded-[20px] bg-cream/70 px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] ring-1 ring-black/5"
                      >
                        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-4.5" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-medium leading-7 text-text-dark">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </FadeIn>

                  <FadeIn className="pt-1">
                    <AffiliateCtaButton
                      productId={product.productId}
                      productSlug={product.slug}
                      affiliateUrl={product.affiliateUrl}
                      label="Buy Now"
                      className="mt-0 min-h-12 px-6 text-xs sm:w-auto"
                    />
                  </FadeIn>

                </div>
              </div>
            </section>

            <div className="hidden md:block lg:hidden">
              <SidebarColumn
                sections={sections}
                sidebarFacts={sidebarFacts}
                product={product}
              />
            </div>

            <ReviewSection
              id="what-is-product"
              icon={PackageCheck}
              title={`What Is ${product.name}?`}
              subtitle="A clean, SEO-friendly review section that explains purpose, positioning, and how this supplement is typically researched by shoppers."
            >
              <ContentPanel paragraphs={whatIsParagraphs} />
            </ReviewSection>

            {product.standoutPoints.length ? (
              <ReviewSection
                id="why-it-stands-out"
                icon={Sparkles}
                title="Why This Product Stands Out"
                subtitle="Positioned for readers who want a stronger understanding of the formula, ingredient emphasis, and practical differentiators."
                tone="cream"
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {product.standoutPoints.map((point, index) => (
                    <FadeIn
                      key={point}
                      delay={index * 0.05}
                      className="rounded-[24px] bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] ring-1 ring-black/5"
                    >
                      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
                        <Sparkles className="size-5" aria-hidden="true" />
                      </span>
                      <p className="mt-4 text-base leading-7 text-text-dark">{point}</p>
                    </FadeIn>
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {product.howItWorks.length ? (
              <ReviewSection
                id="how-it-works"
                icon={FlaskConical}
                title={`How ${product.name} Works`}
                subtitle="Mechanism and ingredient interaction are presented in a cleaner research-oriented layout without changing the underlying data model."
              >
                <div className="space-y-4">
                  {product.howItWorks.map((paragraph, index) => (
                    <FadeIn
                      key={`${paragraph.slice(0, 36)}-${index + 1}`}
                      delay={index * 0.05}
                      className="rounded-[24px] bg-cream/70 p-5 ring-1 ring-black/5"
                    >
                      <div className="flex items-start gap-4">
                        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white font-heading text-base font-bold text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                          {index + 1}
                        </span>
                        <p className="text-base leading-8 text-muted">{paragraph}</p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {product.benefits.length ? (
              <ReviewSection
                id="benefits"
                icon={ShieldCheck}
                title="Key Benefits"
                subtitle="Dynamic benefit cards with clearer hierarchy, stronger spacing, and better scanning for readers comparing formulas."
                tone="cream"
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {product.benefits.map((benefit, index) => {
                    const Icon = benefitIcon(benefit.title);

                    return (
                      <FadeIn
                        key={benefit.title}
                        delay={index * 0.04}
                        className="h-full rounded-[24px] bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.08)]"
                      >
                        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <h3 className="mt-4 font-heading text-xl font-extrabold text-text-dark">
                          {benefit.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-muted">
                          {benefit.description}
                        </p>
                      </FadeIn>
                    );
                  })}
                </div>
              </ReviewSection>
            ) : null}

            {product.ingredients.length ? (
              <ReviewSection
                id="ingredients"
                icon={Beaker}
                title="Ingredient Breakdown"
                subtitle="A professional table-style section built for internal linking, SEO depth, and easier ingredient-level comparison."
              >
                <div className="overflow-hidden rounded-[26px] bg-white ring-1 ring-black/5">
                  <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.4fr)_160px] gap-4 border-b border-black/6 bg-cream/70 px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-muted lg:grid">
                    <span>Ingredient</span>
                    <span>Purpose</span>
                    <span>Benefits</span>
                    <span>Learn More</span>
                  </div>
                  <div className="divide-y divide-black/6">
                    {product.ingredients.map((ingredient) => (
                      <div key={`${ingredient.name}-${ingredient.slug || ingredient.purpose || ""}`}>
                        <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.4fr)_160px] gap-4 px-6 py-5 lg:grid">
                          <div className="min-w-0">
                            <p className="font-heading text-lg font-extrabold text-text-dark">
                              {ingredient.name}
                            </p>
                            {ingredient.scientificName ? (
                              <p className="mt-1 text-sm italic text-primary">
                                {ingredient.scientificName}
                              </p>
                            ) : null}
                          </div>
                          <p className="text-sm leading-7 text-muted">
                            {ingredient.purpose || ingredient.category || "Formula support"}
                          </p>
                          <p className="text-sm leading-7 text-muted">{ingredient.benefit}</p>
                          {ingredient.slug ? (
                            <Link
                              href={`/ingredient/${ingredient.slug}`}
                              className="inline-flex items-center gap-2 self-start font-heading text-sm font-bold text-primary transition hover:text-primary/80"
                            >
                              Learn More
                              <ArrowUpRight className="size-4" />
                            </Link>
                          ) : (
                            <span className="text-sm text-muted">Official label</span>
                          )}
                        </div>

                        <div className="space-y-4 px-5 py-5 lg:hidden">
                          <div>
                            <p className="font-heading text-lg font-extrabold text-text-dark">
                              {ingredient.name}
                            </p>
                            {ingredient.scientificName ? (
                              <p className="mt-1 text-sm italic text-primary">
                                {ingredient.scientificName}
                              </p>
                            ) : null}
                          </div>
                          <InfoLine
                            label="Purpose"
                            value={
                              ingredient.purpose || ingredient.category || "Formula support"
                            }
                          />
                          <InfoLine label="Benefits" value={ingredient.benefit} />
                          {ingredient.slug ? (
                            <Link
                              href={`/ingredient/${ingredient.slug}`}
                              className="inline-flex items-center gap-2 font-heading text-sm font-bold text-primary"
                            >
                              Learn More
                              <ArrowUpRight className="size-4" />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ReviewSection>
            ) : null}

            {product.whoItsBestFor.length ? (
              <ReviewSection
                id="who-is-it-best-for"
                icon={Users}
                title="Who Is It Best For?"
                subtitle="A clean reader-friendly section showing the most likely use cases and shopper intent behind the formula."
                tone="cream"
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {product.whoItsBestFor.map((item, index) => (
                    <FadeIn
                      key={item}
                      delay={index * 0.04}
                      className="rounded-[24px] bg-white p-5 ring-1 ring-black/5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-4.5" />
                        </span>
                        <p className="text-sm leading-7 text-text-dark">{item}</p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            <ReviewSection
              id="safety"
              icon={ShieldAlert}
              title="Safety Information"
              subtitle="Trust-focused safety cards help readers review side effects, who should avoid the product, possible interactions, and general precautions."
            >
              <div className="grid items-stretch gap-5 xl:grid-cols-2 2xl:grid-cols-4">
                <SafetyCard
                  title="Possible Side Effects"
                  icon={CircleAlert}
                  items={product.safety.sideEffects}
                />
                <SafetyCard
                  title="Who Should Avoid"
                  icon={Users}
                  items={product.safety.whoShouldAvoid}
                />
                <SafetyCard
                  title="Drug Interactions"
                  icon={Pill}
                  items={product.safety.drugInteractions}
                />
                <SafetyCard
                  title="General Precautions"
                  icon={ShieldCheck}
                  items={product.safety.precautions}
                />
              </div>
            </ReviewSection>

            <ReviewSection
              id="pros-cons"
              icon={BadgeCheck}
              title="Pros & Cons"
              subtitle="A faster comparison layout for readers balancing upside, tradeoffs, and buying fit."
              tone="cream"
            >
              <ProsCons pros={product.pros} cons={product.cons} />
            </ReviewSection>

            {product.faqs.length ? (
              <ReviewSection
                id="faq"
                icon={BookOpenText}
                title="Frequently Asked Questions"
                subtitle="Smooth accordion interactions with section IDs, deep-link friendly structure, and schema-ready content."
              >
                <div className="grid gap-5 xl:grid-cols-2">
                  {faqColumns.map((column, index) => (
                    <FadeIn
                      key={`faq-column-${index + 1}`}
                      className="rounded-[24px] bg-cream/50 p-3 ring-1 ring-black/5"
                    >
                      <FAQAccordion faqs={column} />
                    </FadeIn>
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            <ReviewSection
              id="verdict"
              icon={Star}
              title="SuppRiva Verdict"
              subtitle="A premium summary section that helps readers decide whether this product belongs on their shortlist."
              tone="cream"
            >
              <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-stretch">
                <div className="flex h-full flex-col items-center justify-center rounded-[24px] bg-white p-5 text-center ring-1 ring-black/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Overall Rating
                  </p>
                  <p className="mt-3 font-heading text-5xl font-extrabold text-text-dark">
                    {product.rating}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={`verdict-star-${index + 1}`}
                        className={`size-4 ${index < Math.round(product.ratingValue) ? "fill-gold text-gold" : "text-gold/35"}`}
                      />
                    ))}
                  </div>
                </div>
                  <div className="flex h-full flex-col justify-center space-y-5">
                  <p className="text-lg leading-8 text-muted">{product.verdict.summary}</p>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <VerdictFact label="Best For" value={product.verdict.bestFor} />
                    <VerdictFact
                      label="Not Ideal For"
                      value={product.verdict.notIdealFor}
                    />
                    <VerdictFact
                      label="Recommendation"
                      value={product.verdict.recommendation}
                    />
                  </div>
                </div>
              </div>
            </ReviewSection>

            <ReviewSection
              id="where-to-buy"
              icon={PackageCheck}
              title={`Where To Buy ${product.name}`}
              subtitle="A dedicated purchase section with official-website guidance and a direct action path for readers ready to review the offer."
            >
              <FadeIn className="rounded-[24px] bg-cream/70 p-6 ring-1 ring-black/5">
                <div className="space-y-4">
                  {product.buyingGuidance.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-4.5" />
                      </span>
                      <p className="text-sm leading-7 text-muted">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <AffiliateCtaButton
                    productId={product.productId}
                    productSlug={product.slug}
                    affiliateUrl={product.affiliateUrl}
                  />
                </div>
              </FadeIn>
            </ReviewSection>

            {product.relatedIngredients.length ? (
              <ReviewSection
                id="related-ingredients"
                icon={Leaf}
                title="Related Ingredients"
                subtitle="Internal linking support for ingredient-level research, comparison, and topical SEO depth."
                tone="cream"
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {product.relatedIngredients.map((ingredient, index) => (
                    <RelatedIngredientCard
                      key={`${ingredient.slug || ingredient.name}-${index}`}
                      ingredient={ingredient}
                    />
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {product.relatedArticles.length ? (
              <ReviewSection
                id="learn-more"
                icon={BookOpenText}
                title="Learn More"
                subtitle="Related editorial resources connected through matching topics, categories, and ingredient language."
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {product.relatedArticles.map((article) => (
                    <RelatedArticleCard key={article.slug || article.title} article={article} />
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {product.comparisonProducts.length ? (
              <ReviewSection
                id="compare-alternatives"
                icon={PackageCheck}
                title="Compare Alternatives"
                subtitle="A stronger comparison-ready section for visitors who want to evaluate similar products before clicking out."
                tone="cream"
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {product.comparisonProducts.map((item) => (
                    <FadeIn
                      key={item.href || item.slug || item.name}
                      className="rounded-[24px] bg-white p-5 ring-1 ring-black/5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary">
                          {item.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-pill bg-gold/10 px-3 py-1.5 text-sm font-semibold text-text-dark">
                          <Star className="size-4 fill-gold text-gold" />
                          {item.rating}
                        </span>
                      </div>
                      <h3 className="mt-4 font-heading text-xl font-extrabold text-text-dark">
                        {item.name}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted">{item.subtitle}</p>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-bold text-primary transition hover:text-primary/80"
                        >
                          Compare product
                          <ArrowUpRight className="size-4" />
                        </Link>
                      ) : null}
                    </FadeIn>
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {product.relatedProducts?.length ? (
              <ReviewSection
                id="related-products"
                icon={PackageCheck}
                title="Related Products"
                subtitle="The current related product carousel remains intact, now sitting inside a stronger long-form review architecture."
              >
                <RelatedProductsSlider products={product.relatedProducts} />
              </ReviewSection>
            ) : null}

            {product.healthNeeds.length ? (
              <ReviewSection
                id="explore-health-needs"
                icon={HeartPulse}
                title="Explore By Health Needs"
                subtitle="Premium category cards that keep product readers moving into broader topical journeys."
                tone="cream"
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {product.healthNeeds.map((item, index) => {
                    const Icon = healthNeedIcon(item.label);

                    return (
                      <motion.div
                        key={item.slug || item.label}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{
                          duration: 0.4,
                          ease: "easeOut",
                          delay: index * 0.04,
                        }}
                      >
                        <Link
                          href={item.slug ? `/category/${item.slug}` : "/categories"}
                          className="group flex h-full flex-col items-center justify-center rounded-[24px] bg-white px-5 py-6 text-center ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.08)]"
                        >
                          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
                            <Icon className="size-5" />
                          </span>
                          <h3 className="mt-4 font-heading text-lg font-extrabold text-text-dark">
                            {item.label}
                          </h3>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </ReviewSection>
            ) : null}
          </div>

          <aside className="hidden lg:block lg:self-start lg:sticky lg:top-28">
            <SidebarColumn sections={sections} sidebarFacts={sidebarFacts} product={product} />
          </aside>
        </div>
      </div>
      <ExpertChatWidget productName={product.name} productPath={product.path} />
    </main>
  );
}

function SidebarColumn({
  sections,
  sidebarFacts,
  product,
}: {
  sections: IngredientSectionLink[];
  sidebarFacts: Array<{
    label: string;
    value: string;
    icon: typeof ClipboardList;
  }>;
  product: ProductDetail;
}) {
  return (
    <div className="h-fit space-y-5">
      <IngredientSectionNav sections={sections} />

      <FadeIn className={sectionCardClasses()}>
        <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
          At A Glance
        </p>
        <div className="mt-5 space-y-3">
          {sidebarFacts.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-[18px] bg-cream/60 px-4 py-3 ring-1 ring-black/5"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                <item.icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {item.label}
                </p>
                <p className="mt-1 font-heading text-sm font-bold leading-6 text-text-dark">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn className={sectionCardClasses()}>
        <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Official Website
        </p>
        <p className="mt-4 text-sm leading-7 text-muted">
          For the latest pricing, serving details, and label transparency, use the official
          website before purchase.
        </p>
        <AffiliateCtaButton
          productId={product.productId}
          productSlug={product.slug}
          affiliateUrl={product.affiliateUrl}
        />
      </FadeIn>
    </div>
  );
}

function ReviewSection({
  id,
  icon: Icon,
  title,
  subtitle,
  tone = "white",
  children,
}: {
  id: string;
  icon: typeof ShieldCheck;
  title: string;
  subtitle: string;
  tone?: "white" | "cream";
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${sectionCardClasses(tone)} scroll-mt-28`}>
      <SectionHeading icon={Icon} title={title} subtitle={subtitle} />
      {children}
    </section>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof ShieldCheck;
  title: string;
  subtitle: string;
}) {
  return (
    <FadeIn className="mb-8 flex items-start gap-4">
      <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_14px_36px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="max-w-3xl">
        <h2 className="font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base leading-7 text-muted">{subtitle}</p>
      </div>
    </FadeIn>
  );
}

function ContentPanel({ paragraphs }: { paragraphs: string[] }) {
  const visibleParagraphs = paragraphs.filter(hasText);

  if (!visibleParagraphs.length) {
    return null;
  }

  return (
    <FadeIn className="rounded-[24px] bg-cream/70 p-6 ring-1 ring-black/5 md:p-8">
      <div className="space-y-5">
        {visibleParagraphs.map((paragraph) => (
          <p key={paragraph} className="text-base leading-8 text-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </FadeIn>
  );
}

function SingleProductImageCard({
  productName,
  image,
}: {
  productName: string;
  image: string;
}) {
  return (
    <FadeIn className="rounded-[32px] border border-border-light bg-white p-5 shadow-premium lg:p-6">
      <div className="relative flex h-[340px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-primary/[0.16] to-gold/[0.18] sm:h-[420px]">
        <span
          aria-hidden="true"
          className="absolute size-72 rounded-full bg-gold/18 blur-3xl transition duration-500"
        />
        <span className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-pill border border-primary/14 bg-white px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          Best Seller
        </span>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-[285px] w-[255px] sm:h-[360px] sm:w-[330px]"
        >
          <Image
            src={image}
            alt={`${productName} supplement product image`}
            fill
            priority
            sizes="(max-width: 768px) 320px, 420px"
            className="object-contain drop-shadow-[0_34px_42px_rgba(6,57,33,0.24)] transition duration-500 hover:scale-105"
          />
        </motion.div>
      </div>
    </FadeIn>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-cream/60 px-4 py-3 ring-1 ring-black/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7 text-text-dark">{value}</p>
    </div>
  );
}

function SafetyCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof ShieldAlert;
  items: string[];
}) {
  if (!items.length) {
    return null;
  }

  const visibleItems = items.slice(0, 2);

  return (
    <FadeIn className="flex h-full flex-col rounded-[24px] bg-cream/70 p-6 ring-1 ring-black/5">
      <div className="min-h-[116px]">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-heading text-xl font-extrabold leading-[1.2] text-text-dark">
          {title}
        </h3>
      </div>
      <ul className="mt-5 grid flex-1 auto-rows-fr gap-3">
        {visibleItems.map((item) => (
          <li
            key={item}
            className="flex h-full min-h-[112px] items-start gap-3 rounded-[18px] bg-white px-4 py-3 text-sm leading-7 text-muted ring-1 ring-black/5"
          >
            <Check className="mt-1 size-4 shrink-0 text-primary" />
            <span
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
              }}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </FadeIn>
  );
}

function VerdictFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-full flex-col rounded-[22px] bg-white px-4 py-4 ring-1 ring-black/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7 text-text-dark">{value}</p>
    </div>
  );
}

function RelatedIngredientCard({
  ingredient,
}: {
  ingredient: ProductDetail["relatedIngredients"][number];
}) {
  const content = (
    <>
      <div className="relative h-[220px] overflow-hidden rounded-[24px] bg-gradient-to-br from-white to-soft-green">
        <Image
          src={ingredient.image || "/assets/hero-supplements.webp"}
          alt={ingredient.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="mt-5">
        {ingredient.category ? (
          <span className="rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary">
            {ingredient.category}
          </span>
        ) : null}
        <h3 className="mt-4 font-heading text-2xl font-extrabold text-text-dark">
          {ingredient.name}
        </h3>
        {ingredient.scientificName ? (
          <p className="mt-2 text-sm italic text-primary">{ingredient.scientificName}</p>
        ) : null}
        {ingredient.benefit ? (
          <p className="mt-3 text-sm leading-7 text-muted">{ingredient.benefit}</p>
        ) : null}
        {ingredient.slug ? (
          <span className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary">
            Explore ingredient
            <ArrowUpRight className="size-4" />
          </span>
        ) : null}
      </div>
    </>
  );

  return ingredient.slug ? (
    <FadeIn className="group relative h-full overflow-hidden rounded-[26px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-premium-hover">
      <Link
        href={`/ingredient/${ingredient.slug}`}
        className="absolute inset-0 z-20 rounded-[26px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        aria-label={`View ${ingredient.name}`}
      />
      <div className="relative z-10">{content}</div>
    </FadeIn>
  ) : (
    <FadeIn className="group relative h-full overflow-hidden rounded-[26px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
      {content}
    </FadeIn>
  );
}

function RelatedArticleCard({
  article,
}: {
  article: ProductDetail["relatedArticles"][number];
}) {
  return (
    <FadeIn className="group relative h-full overflow-hidden rounded-[26px] border border-border-light bg-white shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-premium-hover">
      {article.slug ? (
        <Link
          href={`/blog/${article.slug}`}
          className="absolute inset-0 z-20 rounded-[26px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          aria-label={`Read ${article.title}`}
        />
      ) : null}
      <div className="relative h-[220px] overflow-hidden bg-soft-green">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="relative z-10 p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span className="rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary">
            {article.category}
          </span>
          <span>{article.readingTime}</span>
        </div>
        <h3 className="mt-4 font-heading text-2xl font-extrabold leading-tight text-text-dark">
          {article.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted">{article.description}</p>
        <span className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary">
          Read article
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </FadeIn>
  );
}
