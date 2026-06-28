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
  PackageCheck,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { CategoryPill } from "@/components/category/CategoryPill";
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
import { getCategoryIcon } from "@/lib/live-data";

type LayoutSectionKey = ProductDetail["layoutSections"][number]["sectionKey"];

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

const heroIconMap = new Map(
  [
    ["badge", BadgeCheck],
    ["beaker", Beaker],
    ["book", BookOpenText],
    ["check", Check],
    ["alert", CircleAlert],
    ["clipboard", ClipboardList],
    ["flask", FlaskConical],
    ["heart", HeartPulse],
    ["leaf", Leaf],
    ["package", PackageCheck],
    ["pill", Pill],
    ["shield", ShieldCheck],
    ["sparkles", Sparkles],
    ["star", Star],
    ["users", Users],
  ].map(([key, icon]) => [key, icon as typeof Check]),
);

function heroIcon(icon?: string | null) {
  if (!icon) {
    return Check;
  }

  return heroIconMap.get(icon.trim().toLowerCase()) ?? Check;
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
  const whatIsParagraphs = product.whatIs.paragraphs.filter(hasText);
  const hasVerdict =
    hasText(product.verdict.summary) ||
    hasText(product.verdict.bestFor) ||
    hasText(product.verdict.notIdealFor) ||
    hasText(product.verdict.recommendation) ||
    hasText(product.verdict.conclusion);
  const layoutByKey = new Map(
    product.layoutSections.map((section) => [section.sectionKey, section]),
  );
  const sectionLayout = (sectionKey: LayoutSectionKey) => layoutByKey.get(sectionKey);
  const sectionVisible = (sectionKey: LayoutSectionKey) =>
    sectionLayout(sectionKey)?.isVisible !== false;
  const sectionOrder = (sectionKey: LayoutSectionKey) =>
    sectionLayout(sectionKey)?.sortOrder ?? 0;
  const sectionTitle = (sectionKey: LayoutSectionKey, fallback: string) =>
    sectionLayout(sectionKey)?.titleOverride?.trim() || fallback;
  const sectionSubtitle = (sectionKey: LayoutSectionKey, fallback: string) =>
    sectionLayout(sectionKey)?.subtitleOverride?.trim() || fallback;
  const tocLabels = new Map(product.tocItems.map((item) => [item.id, item.label]));

  const defaultSections: Array<IngredientSectionLink & { order: number }> = [
    ...(sectionVisible("hero")
      ? [{ id: "hero", label: sectionTitle("hero", "Overview"), order: sectionOrder("hero") }]
      : []),
    ...(sectionVisible("overview") && whatIsParagraphs.length
      ? [{ id: "what-is-product", label: sectionTitle("overview", product.whatIs.title), order: sectionOrder("overview") }]
      : []),
    ...(sectionVisible("standout") && product.standoutPoints.length
      ? [{ id: "why-it-stands-out", label: sectionTitle("standout", "Why It Stands Out"), order: sectionOrder("standout") }]
      : []),
    ...(sectionVisible("how_it_works") && product.howItWorks.length ? [{ id: "how-it-works", label: sectionTitle("how_it_works", "How It Works"), order: sectionOrder("how_it_works") }] : []),
    ...(sectionVisible("benefits") && product.benefits.length ? [{ id: "benefits", label: sectionTitle("benefits", "Key Benefits"), order: sectionOrder("benefits") }] : []),
    ...(sectionVisible("ingredients") && product.ingredients.length ? [{ id: "ingredients", label: sectionTitle("ingredients", "Ingredient Breakdown"), order: sectionOrder("ingredients") }] : []),
    ...(sectionVisible("best_for") && product.whoItsBestFor.length
      ? [{ id: "who-is-it-best-for", label: sectionTitle("best_for", "Who Is It Best For"), order: sectionOrder("best_for") }]
      : []),
    ...(sectionVisible("safety") && product.safetyItems.length
      ? [{ id: "safety", label: sectionTitle("safety", product.safetyTitle), order: sectionOrder("safety") }]
      : []),
    ...(sectionVisible("pros_cons") && (product.pros.length || product.cons.length) ? [{ id: "pros-cons", label: sectionTitle("pros_cons", "Pros & Cons"), order: sectionOrder("pros_cons") }] : []),
    ...(sectionVisible("faq") && product.faqs.length ? [{ id: "faq", label: sectionTitle("faq", product.faqTitle), order: sectionOrder("faq") }] : []),
    ...(sectionVisible("verdict") && hasVerdict ? [{ id: "verdict", label: sectionTitle("verdict", product.verdictTitle), order: sectionOrder("verdict") }] : []),
    ...(sectionVisible("buying") && product.buyingGuidance.length ? [{ id: "where-to-buy", label: sectionTitle("buying", product.buyingGuideTitle), order: sectionOrder("buying") }] : []),
    ...(sectionVisible("related_ingredients") && product.relatedIngredients.length
      ? [{ id: "related-ingredients", label: sectionTitle("related_ingredients", "Related Ingredients"), order: sectionOrder("related_ingredients") }]
      : []),
    ...(sectionVisible("related_blogs") && product.relatedArticles.length ? [{ id: "learn-more", label: sectionTitle("related_blogs", "Learn More"), order: sectionOrder("related_blogs") }] : []),
    ...(sectionVisible("compare") && product.comparisonProducts.length
      ? [{ id: "compare-alternatives", label: sectionTitle("compare", "Compare Alternatives"), order: sectionOrder("compare") }]
      : []),
    ...(sectionVisible("related_products") && product.relatedProducts?.length
      ? [{ id: "related-products", label: sectionTitle("related_products", "Related Products"), order: sectionOrder("related_products") }]
      : []),
    ...(sectionVisible("health_needs") && product.healthNeeds.length
      ? [{ id: "explore-health-needs", label: sectionTitle("health_needs", "Explore By Health Needs"), order: sectionOrder("health_needs") }]
      : []),
  ];
  const sections: IngredientSectionLink[] = defaultSections
    .sort((first, second) => first.order - second.order)
    .map((section) => ({
      id: section.id,
      label: tocLabels.get(section.id) ?? section.label,
    }));

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
          <div className="flex min-w-0 flex-col gap-8 md:gap-10">
            {sectionVisible("hero") ? (
              <section
                id="hero"
                className={sectionCardClasses()}
                style={{ order: sectionOrder("hero") }}
              >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:items-start">
                <div className="min-w-0 space-y-4">
                  <SingleProductImageCard
                    productName={product.name}
                    image={heroImage}
                    imageAlt={product.heroImageAlt}
                    badge={product.heroBadge}
                    showBadge={product.heroShowBadge}
                  />
                  <FadeIn className="mx-auto w-full max-w-[520px] px-2 pt-1 md:px-3">
                    <div className="space-y-3 text-left">
                      <div className="flex justify-center">
                        <AffiliateCtaButton
                          productId={product.productId}
                          productSlug={product.slug}
                          affiliateUrl={product.affiliateUrl}
                          label={product.heroCtaLabel}
                          target={product.heroCtaTarget}
                          variant="solid"
                          className="mx-auto min-h-11 !px-5 !text-[10.5px] sm:min-h-11"
                        />
                      </div>
                      {product.heroChecklist.length ? (
                        <div className="space-y-2.5">
                          {product.heroChecklist.map((item) => {
                            const ChecklistIcon = heroIcon(item.icon);

                            return (
                              <div key={item.text} className="flex items-start gap-3">
                                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <ChecklistIcon className="size-4" aria-hidden="true" />
                                </span>
                                <p className="text-sm leading-6 text-muted">{item.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
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
                        {sectionTitle("hero", product.heroTitle)}
                      </h1>
                      {sectionSubtitle("hero", product.subtitle) ? (
                        <span className="block max-w-3xl text-[1.02rem] font-semibold leading-8 text-primary">
                          {sectionSubtitle("hero", product.subtitle)}
                        </span>
                      ) : null}
                    </div>

                    {product.heroShowRating ? (
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
                            {product.ratingScaleLabel} ({product.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <p className="max-w-3xl text-lg leading-8 text-muted">
                      {product.description}
                    </p>
                  </FadeIn>

                  <FadeIn className="grid gap-3 md:grid-cols-2">
                    {product.heroHighlights.map((highlight) => {
                      const HighlightIcon = heroIcon(highlight.icon);

                      return (
                        <div
                          key={highlight.title}
                          className="flex items-start gap-3 rounded-[20px] bg-cream/70 px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] ring-1 ring-black/5"
                        >
                          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <HighlightIcon className="size-4.5" aria-hidden="true" />
                          </span>
                          <span className="text-sm font-medium leading-7 text-text-dark">
                            {highlight.title}
                            {highlight.description ? (
                              <span className="block pt-1 text-xs font-normal leading-6 text-muted">
                                {highlight.description}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      );
                    })}
                  </FadeIn>

                  <FadeIn className="pt-1">
                    <AffiliateCtaButton
                      productId={product.productId}
                      productSlug={product.slug}
                      affiliateUrl={product.affiliateUrl}
                      label={product.heroSecondaryCtaLabel}
                      target={product.heroSecondaryCtaTarget}
                      className="mt-0 min-h-12 px-6 text-xs sm:w-auto"
                    />
                  </FadeIn>

                </div>
              </div>
              </section>
            ) : null}

            <div className="hidden md:block lg:hidden" style={{ order: sectionOrder("hero") + 1 }}>
              <SidebarColumn sections={sections} product={product} />
            </div>

            {sectionVisible("overview") && whatIsParagraphs.length ? (
              <ReviewSection
                id="what-is-product"
                icon={PackageCheck}
                title={sectionTitle("overview", product.whatIs.title)}
                subtitle={sectionSubtitle("overview", product.whatIs.subtitle)}
                order={sectionOrder("overview")}
              >
                <ContentPanel paragraphs={whatIsParagraphs} />
              </ReviewSection>
            ) : null}

            {sectionVisible("standout") && product.standoutPoints.length ? (
              <ReviewSection
                id="why-it-stands-out"
                icon={Sparkles}
                title={sectionTitle("standout", product.standoutTitle)}
                subtitle={sectionSubtitle("standout", product.standoutSubtitle)}
                tone="cream"
                order={sectionOrder("standout")}
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {product.standoutPoints.map((point, index) => (
                    <FadeIn
                      key={`${point.title}-${index + 1}`}
                      delay={index * 0.05}
                      className="rounded-[24px] bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] ring-1 ring-black/5"
                    >
                      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
                        {(() => {
                          const Icon = heroIcon(point.icon);
                          return <Icon className="size-5" aria-hidden="true" />;
                        })()}
                      </span>
                      <h3 className="mt-4 font-heading text-lg font-extrabold text-text-dark">
                        {point.title}
                      </h3>
                      {point.description ? (
                        <p className="mt-3 text-sm leading-7 text-muted">
                          {point.description}
                        </p>
                      ) : null}
                    </FadeIn>
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {sectionVisible("how_it_works") && product.howItWorks.length ? (
              <ReviewSection
                id="how-it-works"
                icon={FlaskConical}
                title={sectionTitle("how_it_works", product.howItWorksTitle)}
                subtitle={sectionSubtitle("how_it_works", product.howItWorksSubtitle)}
                order={sectionOrder("how_it_works")}
              >
                <div className="space-y-4">
                  {product.howItWorksIntro.length ? (
                    <ContentPanel paragraphs={product.howItWorksIntro} />
                  ) : null}
                  {product.howItWorks.map((step, index) => (
                    <FadeIn
                      key={`${step.title}-${index + 1}`}
                      delay={index * 0.05}
                      className="rounded-[24px] bg-cream/70 p-5 ring-1 ring-black/5"
                    >
                      <div className="flex flex-col items-start gap-4 md:flex-row">
                        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white font-heading text-base font-bold text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                          {index + 1}
                        </span>
                        <div className="w-full">
                          <h3 className="font-heading text-lg font-extrabold text-text-dark">
                            {step.title}
                          </h3>
                          {step.description ? (
                            <p className="mt-2 text-base leading-8 text-muted">
                              {step.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {sectionVisible("benefits") && product.benefits.length ? (
              <ReviewSection
                id="benefits"
                icon={ShieldCheck}
                title={sectionTitle("benefits", product.benefitsTitle)}
                subtitle={sectionSubtitle("benefits", product.benefitsSubtitle)}
                tone="cream"
                order={sectionOrder("benefits")}
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {product.benefits.map((benefit, index) => {
                    const Icon = benefit.icon ? heroIcon(benefit.icon) : benefitIcon(benefit.title);

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
                        {benefit.description ? (
                          <p className="mt-3 text-sm leading-7 text-muted">
                            {benefit.description}
                          </p>
                        ) : null}
                      </FadeIn>
                    );
                  })}
                </div>
              </ReviewSection>
            ) : null}

            {sectionVisible("ingredients") && product.ingredients.length ? (
              <ReviewSection
                id="ingredients"
                icon={Beaker}
                title={sectionTitle("ingredients", product.ingredientsTitle)}
                subtitle={sectionSubtitle("ingredients", product.ingredientsSubtitle)}
                order={sectionOrder("ingredients")}
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
                            {ingredient.dosage ? (
                              <span className="mt-2 block text-xs font-semibold text-primary">
                                {ingredient.dosage}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-sm leading-7 text-muted">
                            {ingredient.benefit}
                            {ingredient.customNote ? (
                              <span className="mt-2 block rounded-[14px] bg-soft-green/70 px-3 py-2 text-xs font-medium text-primary">
                                {ingredient.customNote}
                              </span>
                            ) : null}
                          </p>
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
                              [
                                ingredient.purpose || ingredient.category || "Formula support",
                                ingredient.dosage,
                              ]
                                .filter(Boolean)
                                .join(" - ")
                            }
                          />
                          <InfoLine
                            label="Benefits"
                            value={[ingredient.benefit, ingredient.customNote]
                              .filter(Boolean)
                              .join(" - ")}
                          />
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

            {sectionVisible("best_for") && product.whoItsBestFor.length ? (
              <ReviewSection
                id="who-is-it-best-for"
                icon={Users}
                title={sectionTitle("best_for", product.whoItsBestForTitle)}
                subtitle={sectionSubtitle("best_for", product.whoItsBestForSubtitle)}
                tone="cream"
                order={sectionOrder("best_for")}
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {product.whoItsBestFor.map((item, index) => (
                    <FadeIn
                      key={`${item.title}-${index + 1}`}
                      delay={index * 0.04}
                      className="rounded-[24px] bg-white p-5 ring-1 ring-black/5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {(() => {
                            const Icon = heroIcon(item.icon);
                            return <Icon className="size-4.5" />;
                          })()}
                        </span>
                        <div>
                          <h3 className="font-heading text-base font-extrabold text-text-dark">
                            {item.title}
                          </h3>
                          {item.description ? (
                            <p className="mt-2 text-sm leading-7 text-muted">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {sectionVisible("safety") && product.safetyItems.length ? (
              <ReviewSection
                id="safety"
                icon={ShieldAlert}
                title={sectionTitle("safety", product.safetyTitle)}
                subtitle={sectionSubtitle("safety", product.safetySubtitle)}
                order={sectionOrder("safety")}
              >
                <div className="grid items-stretch gap-5 xl:grid-cols-2 2xl:grid-cols-4">
                  {product.safetyItems.map((item, index) => (
                    <SafetyCard
                      key={`${item.title}-${index + 1}`}
                      title={item.title}
                      icon={heroIcon(item.icon)}
                      items={item.description ? [item.description] : []}
                    />
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {sectionVisible("pros_cons") && (product.pros.length || product.cons.length) ? (
              <ReviewSection
                id="pros-cons"
                icon={BadgeCheck}
                title={sectionTitle("pros_cons", product.prosConsTitle)}
                subtitle={sectionSubtitle("pros_cons", product.prosConsSubtitle)}
                tone="cream"
                order={sectionOrder("pros_cons")}
              >
                <ProsCons pros={product.pros} cons={product.cons} />
              </ReviewSection>
            ) : null}

            {sectionVisible("faq") && product.faqs.length ? (
              <ReviewSection
                id="faq"
                icon={BookOpenText}
                title={sectionTitle("faq", product.faqTitle)}
                subtitle={sectionSubtitle("faq", product.faqSubtitle)}
                order={sectionOrder("faq")}
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

            {sectionVisible("verdict") && hasVerdict ? (
              <ReviewSection
                id="verdict"
                icon={Star}
                title={sectionTitle("verdict", product.verdictTitle)}
                subtitle={sectionSubtitle("verdict", product.verdictSubtitle)}
                tone="cream"
                order={sectionOrder("verdict")}
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
                  {product.verdict.summary ? (
                    <p className="text-lg leading-8 text-muted">{product.verdict.summary}</p>
                  ) : null}
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {product.verdict.bestFor ? (
                      <VerdictFact label="Best For" value={product.verdict.bestFor} />
                    ) : null}
                    {product.verdict.notIdealFor ? (
                      <VerdictFact
                        label="Not Ideal For"
                        value={product.verdict.notIdealFor}
                      />
                    ) : null}
                    {product.verdict.recommendation ? (
                      <VerdictFact
                        label="Recommendation"
                        value={product.verdict.recommendation}
                      />
                    ) : null}
                  </div>
                  {product.verdict.conclusion ? (
                    <p className="text-base leading-8 text-muted">
                      {product.verdict.conclusion}
                    </p>
                  ) : null}
                </div>
              </div>
              </ReviewSection>
            ) : null}

            {sectionVisible("buying") && product.buyingGuidance.length ? (
              <ReviewSection
                id="where-to-buy"
                icon={PackageCheck}
                title={sectionTitle("buying", product.buyingGuideTitle)}
                subtitle={sectionSubtitle("buying", product.buyingGuideSubtitle)}
                order={sectionOrder("buying")}
              >
              <FadeIn className="rounded-[24px] bg-cream/70 p-6 ring-1 ring-black/5">
                <div className="space-y-4">
                  {product.buyingGuidance.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {(() => {
                          const Icon = heroIcon(item.icon);
                          return <Icon className="size-4.5" />;
                        })()}
                      </span>
                      <div>
                        <h3 className="font-heading text-sm font-bold text-text-dark">
                          {item.title}
                        </h3>
                        {item.description ? (
                          <p className="mt-1 text-sm leading-7 text-muted">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <AffiliateCtaButton
                    productId={product.productId}
                    productSlug={product.slug}
                    affiliateUrl={product.affiliateUrl}
                    label={product.buyingCtaLabel}
                  />
                </div>
              </FadeIn>
              </ReviewSection>
            ) : null}

            {sectionVisible("related_ingredients") && product.relatedIngredients.length ? (
              <ReviewSection
                id="related-ingredients"
                icon={Leaf}
                title={sectionTitle("related_ingredients", "Related Ingredients")}
                subtitle={sectionSubtitle(
                  "related_ingredients",
                  "Internal linking support for ingredient-level research, comparison, and topical SEO depth.",
                )}
                tone="cream"
                order={sectionOrder("related_ingredients")}
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

            {sectionVisible("related_blogs") && product.relatedArticles.length ? (
              <ReviewSection
                id="learn-more"
                icon={BookOpenText}
                title={sectionTitle("related_blogs", "Learn More")}
                subtitle={sectionSubtitle(
                  "related_blogs",
                  "Related editorial resources connected through matching topics, categories, and ingredient language.",
                )}
                order={sectionOrder("related_blogs")}
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {product.relatedArticles.map((article) => (
                    <RelatedArticleCard key={article.slug || article.title} article={article} />
                  ))}
                </div>
              </ReviewSection>
            ) : null}

            {sectionVisible("compare") && product.comparisonProducts.length ? (
              <ReviewSection
                id="compare-alternatives"
                icon={PackageCheck}
                title={sectionTitle("compare", "Compare Alternatives")}
                subtitle={sectionSubtitle(
                  "compare",
                  "A stronger comparison-ready section for visitors who want to evaluate similar products before clicking out.",
                )}
                tone="cream"
                order={sectionOrder("compare")}
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {product.comparisonProducts.map((item) => (
                    <FadeIn
                      key={item.href || item.slug || item.name}
                      className="flex h-full flex-col rounded-[24px] bg-white p-5 ring-1 ring-black/5"
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
                      <p className="mt-3 flex-1 text-sm leading-7 text-muted">{item.subtitle}</p>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="mt-auto inline-flex items-center gap-2 pt-5 font-heading text-sm font-bold text-primary transition hover:text-primary/80"
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

            {sectionVisible("related_products") && product.relatedProducts?.length ? (
              <ReviewSection
                id="related-products"
                icon={PackageCheck}
                title={sectionTitle("related_products", "Related Products")}
                subtitle={sectionSubtitle(
                  "related_products",
                  "The current related product carousel remains intact, now sitting inside a stronger long-form review architecture.",
                )}
                order={sectionOrder("related_products")}
              >
                <RelatedProductsSlider products={product.relatedProducts} />
              </ReviewSection>
            ) : null}

            {sectionVisible("health_needs") && product.healthNeeds.length ? (
              <ReviewSection
                id="explore-health-needs"
                icon={HeartPulse}
                title={sectionTitle("health_needs", "Explore By Health Needs")}
                subtitle={sectionSubtitle(
                  "health_needs",
                  "Discover wellness categories related to this product and explore solutions for other health goals.",
                )}
                tone="cream"
                order={sectionOrder("health_needs")}
              >
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.04,
                      },
                    },
                  }}
                  className="mt-1 flex flex-wrap gap-3"
                >
                  {product.healthNeeds.map((item, index) => {
                    const Icon = getCategoryIcon(item.label);

                    return (
                      <motion.div
                        key={item.slug || item.label}
                        variants={{
                          hidden: { opacity: 0, y: 16 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        transition={{
                          duration: 0.35,
                          ease: "easeOut",
                          delay: index * 0.01,
                        }}
                      >
                        <CategoryPill
                          label={item.label}
                          icon={Icon}
                          href={item.slug ? `/category/${item.slug}` : "/categories"}
                          className="w-full sm:w-auto sm:max-w-full"
                          labelClassName="whitespace-nowrap text-[13px] sm:text-sm"
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </ReviewSection>
            ) : null}
          </div>

          <aside
            className={`hidden lg:block lg:self-start ${
              product.sidebar.stickyEnabled ? "lg:sticky lg:top-28" : ""
            }`}
          >
            <SidebarColumn sections={sections} product={product} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function SidebarColumn({
  sections,
  product,
}: {
  sections: IngredientSectionLink[];
  product: ProductDetail;
}) {
  return (
    <div className="h-fit space-y-5">
      <IngredientSectionNav sections={sections} />

      <FadeIn className={sectionCardClasses()}>
        <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
          {product.sidebar.heading}
        </p>
        {product.sidebar.description ? (
          <p className="mt-3 text-sm leading-7 text-muted">{product.sidebar.description}</p>
        ) : null}
        <div className="mt-5 space-y-3">
          {product.sidebar.facts.map((item) => {
            const Icon = heroIcon(item.icon);

            return (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-[18px] bg-cream/60 px-4 py-3 ring-1 ring-black/5"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  <Icon className="size-4.5" />
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
            );
          })}
          {product.sidebar.trustBadges.map((item) => {
            const Icon = heroIcon(item.icon);

            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-[18px] bg-soft-green/55 px-4 py-3 ring-1 ring-primary/10"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  <Icon className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-sm font-bold leading-6 text-text-dark">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </FadeIn>

      <FadeIn className={sectionCardClasses()}>
        <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
          {product.sidebar.ctaTitle}
        </p>
        <p className="mt-4 text-sm leading-7 text-muted">
          {product.sidebar.ctaDescription}
        </p>
        <SidebarActionButton product={product} />
      </FadeIn>
    </div>
  );
}

function SidebarActionButton({ product }: { product: ProductDetail }) {
  const ctaUrl =
    product.sidebar.ctaType === "ask_expert"
      ? "/ask-expert"
      : product.sidebar.ctaUrl || product.affiliateUrl || "/products";

  if (product.sidebar.ctaType === "affiliate") {
    return (
      <AffiliateCtaButton
        productId={product.productId}
        productSlug={product.slug}
        affiliateUrl={ctaUrl}
        label={product.sidebar.ctaLabel}
        className="mt-6"
      />
    );
  }

  const className =
    "mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-[linear-gradient(90deg,#063921,#0B5D3B,#0E7A4F)] px-5 font-heading text-[12px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_18px_46px_rgba(11,93,59,0.26)] transition duration-300 hover:shadow-[0_24px_60px_rgba(217,165,32,0.24)] sm:min-h-14 sm:w-auto sm:px-6";

  const content = (
    <>
      {product.sidebar.ctaLabel}
      <ChevronRight className="size-4" aria-hidden="true" />
    </>
  );

  if (product.sidebar.ctaType === "external") {
    return (
      <motion.div
        whileHover={{ scale: 1.025, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3 }}
      >
        <a href={ctaUrl} target="_blank" rel="nofollow noopener noreferrer" className={className}>
          {content}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={ctaUrl} className={className}>
        {content}
      </Link>
    </motion.div>
  );
}

function ReviewSection({
  id,
  icon: Icon,
  title,
  subtitle,
  tone = "white",
  order,
  children,
}: {
  id: string;
  icon: typeof Check;
  title: string;
  subtitle: string;
  tone?: "white" | "cream";
  order?: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${sectionCardClasses(tone)} scroll-mt-28`} style={{ order }}>
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
  icon: typeof Check;
  title: string;
  subtitle: string;
}) {
  return (
    <FadeIn className="mb-8 flex flex-col items-start gap-3 text-left md:flex-row md:items-start md:gap-4">
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_14px_36px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:size-14">
        <Icon className="size-5 md:size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 max-w-3xl w-full flex-1">
        <h2 className="font-heading text-[1.95rem] font-extrabold leading-[1.08] text-text-dark sm:text-[2.2rem] md:text-4xl">
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
  imageAlt,
  badge,
  showBadge,
}: {
  productName: string;
  image: string;
  imageAlt?: string | null;
  badge?: string | null;
  showBadge: boolean;
}) {
  return (
    <FadeIn className="rounded-[32px] border border-border-light bg-white p-5 shadow-premium lg:p-6">
      <div className="relative flex h-[340px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-primary/[0.16] to-gold/[0.18] sm:h-[420px]">
        <span
          aria-hidden="true"
          className="absolute size-72 rounded-full bg-gold/18 blur-3xl transition duration-500"
        />
        {showBadge && badge ? (
          <span className="absolute left-5 top-4 z-10 rounded-pill border border-primary/14 bg-white px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            {badge}
          </span>
        ) : null}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-[285px] w-[255px] sm:h-[360px] sm:w-[330px]"
        >
          <Image
            src={image}
            alt={imageAlt || `${productName} supplement product image`}
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
  icon: typeof Check;
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
