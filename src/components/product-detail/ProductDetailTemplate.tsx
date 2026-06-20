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
import { FadeIn } from "@/components/ui/FadeIn";
import { AffiliateCtaButton } from "@/components/product-detail/AffiliateCtaButton";
import { FAQAccordion } from "@/components/product-detail/FAQAccordion";
import { ProductGallery } from "@/components/product-detail/ProductGallery";
import { ProsCons } from "@/components/product-detail/ProsCons";
import { RelatedProductsSlider } from "@/components/product-detail/RelatedProductsSlider";
import { IngredientSectionNav, type IngredientSectionLink } from "@/components/ingredients/IngredientSectionNav";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
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

export function ProductDetailTemplate({ product }: { product: ProductDetail }) {
  const faqColumns = splitIntoColumns(product.faqs, 2);
  const whatIsParagraphs = [
    product.description,
    `${product.name} is positioned in the ${product.category.toLowerCase()} category and is typically considered by readers comparing ingredient depth, benefit focus, and day-to-day usability.`,
    `Consumers usually evaluate ${product.name} around goals like ${product.bestFor.toLowerCase()} while reviewing ingredient transparency and overall formula support.`,
  ].filter(hasText) as string[];
  const researchSnapshotItems = [
    product.category,
    `${product.ingredients.length} ingredients profiled`,
    `${product.benefits.length} benefit areas highlighted`,
    product.bestFor,
  ];
  const sections: IngredientSectionLink[] = [
    { id: "what-is-product", label: `What Is ${product.name}?` },
    ...(product.standoutPoints.length
      ? [{ id: "why-it-stands-out", label: "Why It Stands Out" }]
      : []),
    ...(product.howItWorks.length ? [{ id: "how-it-works", label: "How It Works" }] : []),
    ...(product.benefits.length ? [{ id: "benefits", label: "Benefits" }] : []),
    ...(product.ingredients.length ? [{ id: "ingredients", label: "Ingredients" }] : []),
    ...(product.whoItsBestFor.length ? [{ id: "who-is-it-best-for", label: "Who Is It Best For" }] : []),
    ...(product.safety.sideEffects.length ||
    product.safety.whoShouldAvoid.length ||
    product.safety.drugInteractions.length ||
    product.safety.precautions.length
      ? [{ id: "safety", label: "Safety" }]
      : []),
    ...(product.pros.length || product.cons.length ? [{ id: "pros-cons", label: "Pros & Cons" }] : []),
    ...(product.faqs.length ? [{ id: "faq", label: "FAQ" }] : []),
    ...(hasText(product.verdict.summary) ? [{ id: "verdict", label: "Verdict" }] : []),
    { id: "where-to-buy", label: "Where To Buy" },
    ...(product.relatedIngredients.length
      ? [{ id: "related-ingredients", label: "Related Ingredients" }]
      : []),
    ...(product.relatedArticles.length ? [{ id: "learn-more", label: "Learn More" }] : []),
    ...(product.comparisonProducts.length
      ? [{ id: "compare-alternatives", label: "Compare Alternatives" }]
      : []),
    ...(product.relatedProducts?.length ? [{ id: "related-products", label: "Related Products" }] : []),
    ...(product.healthNeeds.length ? [{ id: "explore-health-needs", label: "Explore By Health Needs" }] : []),
  ];
  const sidebarFacts = [
    { label: "Category", value: product.category, icon: ClipboardList },
    { label: "Best For", value: product.bestFor, icon: ShieldCheck },
    { label: "Ingredient Count", value: String(product.ingredients.length), icon: Beaker },
    { label: "Rating", value: `${product.rating} / 5`, icon: Star },
    { label: "Related Articles", value: String(product.relatedArticles.length), icon: BookOpenText },
    { label: "Related Ingredients", value: String(product.relatedIngredients.length), icon: Leaf },
  ];

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-cream pb-10 pt-8 md:pb-12 lg:pb-14">
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
            <Link href="/products" className="transition hover:text-primary">
              Supplements
            </Link>
            {product.categorySlug ? (
              <>
                <ChevronRight className="size-4" aria-hidden="true" />
                <Link href={`/category/${product.categorySlug}`} className="transition hover:text-primary">
                  {product.category}
                </Link>
              </>
            ) : null}
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="font-heading font-semibold text-text-dark">{product.name}</span>
          </nav>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.1fr)_320px] xl:items-start">
            <FadeIn className="min-w-0">
              <ProductGallery
                productName={product.name}
                images={product.gallery?.length ? product.gallery : product.image ? [product.image] : []}
              />
            </FadeIn>

            <div className="min-w-0 space-y-6">
              <FadeIn className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-pill border border-primary/14 bg-white px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    Featured Product
                  </span>
                  <Link
                    href={product.categorySlug ? `/category/${product.categorySlug}` : "/categories"}
                    className="inline-flex items-center gap-2 rounded-pill border border-[#8B5CF6]/18 bg-[#8B5CF6]/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9] transition hover:bg-[#8B5CF6]/14"
                  >
                    {product.category}
                  </Link>
                </div>

                <div className="space-y-3">
                  <h1 className="font-heading text-5xl font-extrabold leading-[0.98] text-text-dark md:text-6xl xl:text-[4.45rem]">
                    {product.name}
                  </h1>
                  <p className="max-w-3xl text-xl leading-8 text-primary md:text-2xl">
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
                  {product.trustBadges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-2 rounded-pill bg-white px-3 py-1.5 text-xs font-semibold text-muted ring-1 ring-black/6"
                    >
                      <BadgeCheck className="size-4 text-primary" />
                      {badge}
                    </span>
                  ))}
                </div>

                <p className="max-w-3xl text-lg leading-8 text-muted">
                  {product.description}
                </p>
              </FadeIn>

              <FadeIn className="grid gap-3 md:grid-cols-2">
                {product.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="flex items-start gap-3 rounded-[20px] bg-white/78 px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] ring-1 ring-black/5"
                  >
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium leading-7 text-text-dark">{bullet}</span>
                  </div>
                ))}
              </FadeIn>

              <FadeIn className="flex flex-wrap items-center gap-4">
                <AffiliateCtaButton
                  productId={product.productId}
                  productSlug={product.slug}
                  affiliateUrl={product.affiliateUrl}
                />
                <p className="max-w-2xl text-sm leading-7 text-muted">
                  Suppriva may earn from qualifying purchases. Our review structure stays focused on product research, ingredient transparency, and practical comparison.
                </p>
              </FadeIn>
            </div>

            <div className="h-fit space-y-5 xl:sticky xl:top-28 xl:self-start">
              <IngredientSectionNav sections={sections} />

              <FadeIn className="rounded-[28px] bg-white/92 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
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

              <FadeIn className="rounded-[28px] bg-white/92 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Official Website
                </p>
                <p className="mt-4 text-sm leading-7 text-muted">
                  For the latest pricing, serving details, and label transparency, use the official website before purchase.
                </p>
                <AffiliateCtaButton
                  productId={product.productId}
                  productSlug={product.slug}
                  affiliateUrl={product.affiliateUrl}
                />
              </FadeIn>
            </div>
          </div>

          <div className="mt-6 xl:hidden">
            <IngredientSectionNav sections={sections} mobile />
          </div>

          <div className="mt-12 grid gap-6 xl:mt-14 xl:grid-cols-[minmax(0,1fr)_300px] xl:pr-[352px]">
            <div id="what-is-product" className="scroll-mt-28">
              <SectionHeading
                icon={PackageCheck}
                title={`What Is ${product.name}?`}
                subtitle="A clean, SEO-friendly review section that explains purpose, positioning, and how this supplement is typically researched by shoppers."
              />
              <ContentPanel paragraphs={whatIsParagraphs} />
            </div>
            <div className="hidden xl:block">
              <AsideFactCard
                title="Research Snapshot"
                icon={ClipboardList}
                items={researchSnapshotItems}
              />
            </div>
          </div>
        </div>
      </section>

      {product.standoutPoints.length ? (
        <SectionWrapper id="why-it-stands-out" className="scroll-mt-28">
          <SectionHeading
            icon={Sparkles}
            title="Why This Product Stands Out"
            subtitle="Positioned for readers who want a stronger understanding of the formula, ingredient emphasis, and practical differentiators."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {product.standoutPoints.map((point, index) => (
              <FadeIn
                key={point}
                delay={index * 0.05}
                className="rounded-[26px] bg-white/92 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 text-base leading-7 text-text-dark">{point}</p>
              </FadeIn>
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      {product.howItWorks.length ? (
        <SectionWrapper id="how-it-works" tone="white" className="scroll-mt-28">
          <SectionHeading
            icon={FlaskConical}
            title={`How ${product.name} Works`}
            subtitle="Mechanism and ingredient interaction are presented in a cleaner research-oriented layout without changing the underlying data model."
          />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              {product.howItWorks.map((paragraph, index) => (
                <FadeIn
                  key={`${paragraph.slice(0, 36)}-${index + 1}`}
                  delay={index * 0.05}
                  className="rounded-[26px] bg-white/92 p-6 shadow-[0_16px_44px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-base font-bold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-base leading-8 text-muted">{paragraph}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
            <AsideFactCard
              title="Formula Roles"
              icon={Beaker}
              items={product.ingredients.slice(0, 4).map((ingredient) => `${ingredient.name}: ${ingredient.purpose || ingredient.benefit}`)}
            />
          </div>
        </SectionWrapper>
      ) : null}

      {product.benefits.length ? (
        <SectionWrapper id="benefits" className="scroll-mt-28">
          <SectionHeading
            icon={ShieldCheck}
            title="Key Benefits"
            subtitle="Dynamic benefit cards with clearer hierarchy, stronger spacing, and better scanning for readers comparing formulas."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {product.benefits.map((benefit, index) => {
              const Icon = benefitIcon(benefit.title);

              return (
                <FadeIn
                  key={benefit.title}
                  delay={index * 0.04}
                  className="h-full rounded-[26px] bg-white/92 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.08)]"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-heading text-xl font-extrabold text-text-dark">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{benefit.description}</p>
                </FadeIn>
              );
            })}
          </div>
        </SectionWrapper>
      ) : null}

      {product.ingredients.length ? (
        <SectionWrapper id="ingredients" tone="white" className="scroll-mt-28">
          <SectionHeading
            icon={Beaker}
            title="Ingredient Breakdown"
            subtitle="A professional table-style section built for internal linking, SEO depth, and easier ingredient-level comparison."
          />
          <FadeIn className="overflow-hidden rounded-[30px] bg-white shadow-[0_20px_54px_rgba(15,23,42,0.07)] ring-1 ring-black/5">
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
                      <p className="font-heading text-lg font-extrabold text-text-dark">{ingredient.name}</p>
                      {ingredient.scientificName ? (
                        <p className="mt-1 text-sm italic text-primary">{ingredient.scientificName}</p>
                      ) : null}
                    </div>
                    <p className="text-sm leading-7 text-muted">{ingredient.purpose || ingredient.category || "Formula support"}</p>
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
                      <p className="font-heading text-lg font-extrabold text-text-dark">{ingredient.name}</p>
                      {ingredient.scientificName ? (
                        <p className="mt-1 text-sm italic text-primary">{ingredient.scientificName}</p>
                      ) : null}
                    </div>
                    <InfoLine label="Purpose" value={ingredient.purpose || ingredient.category || "Formula support"} />
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
          </FadeIn>
        </SectionWrapper>
      ) : null}

      {product.whoItsBestFor.length ? (
        <SectionWrapper id="who-is-it-best-for" className="scroll-mt-28">
          <SectionHeading
            icon={Users}
            title="Who Is It Best For?"
            subtitle="A clean reader-friendly section showing the most likely use cases and shopper intent behind the formula."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {product.whoItsBestFor.map((item, index) => (
              <FadeIn
                key={item}
                delay={index * 0.04}
                className="rounded-[24px] bg-white/92 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
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
        </SectionWrapper>
      ) : null}

      <SectionWrapper id="safety" tone="white" className="scroll-mt-28">
        <SectionHeading
          icon={ShieldAlert}
          title="Safety Information"
          subtitle="Trust-focused safety cards help readers review side effects, who should avoid the product, possible interactions, and general precautions."
        />
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
          <SafetyCard title="Possible Side Effects" icon={CircleAlert} items={product.safety.sideEffects} />
          <SafetyCard title="Who Should Avoid" icon={Users} items={product.safety.whoShouldAvoid} />
          <SafetyCard title="Drug Interactions" icon={Pill} items={product.safety.drugInteractions} />
          <SafetyCard title="General Precautions" icon={ShieldCheck} items={product.safety.precautions} />
        </div>
      </SectionWrapper>

      <SectionWrapper id="pros-cons" className="scroll-mt-28">
        <SectionHeading
          icon={BadgeCheck}
          title="Pros & Cons"
          subtitle="A faster comparison layout for readers balancing upside, tradeoffs, and buying fit."
        />
        <div className="mt-8">
          <ProsCons pros={product.pros} cons={product.cons} />
        </div>
      </SectionWrapper>

      {product.faqs.length ? (
        <SectionWrapper id="faq" tone="white" className="scroll-mt-28">
          <SectionHeading
            icon={BookOpenText}
            title="Frequently Asked Questions"
            subtitle="Smooth accordion interactions with section IDs, deep-link friendly structure, and schema-ready content."
          />
          <div className="grid gap-5 xl:grid-cols-2">
            {faqColumns.map((column, index) => (
              <FadeIn
                key={`faq-column-${index + 1}`}
                className="rounded-[28px] bg-white/88 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
              >
                <FAQAccordion faqs={column} />
              </FadeIn>
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      <SectionWrapper id="verdict" className="scroll-mt-28">
        <SectionHeading
          icon={Star}
          title="SuppRiva Verdict"
          subtitle="A premium summary section that helps readers decide whether this product belongs on their shortlist."
        />
        <FadeIn className="rounded-[32px] bg-white/92 p-6 shadow-[0_20px_58px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
            <div className="rounded-[28px] bg-cream/80 p-5 text-center ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Overall Rating</p>
              <p className="mt-3 font-heading text-5xl font-extrabold text-text-dark">{product.rating}</p>
              <div className="mt-3 flex items-center justify-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`verdict-star-${index + 1}`}
                    className={`size-4 ${index < Math.round(product.ratingValue) ? "fill-gold text-gold" : "text-gold/35"}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <p className="text-lg leading-8 text-muted">{product.verdict.summary}</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <VerdictFact label="Best For" value={product.verdict.bestFor} />
                <VerdictFact label="Not Ideal For" value={product.verdict.notIdealFor} />
                <VerdictFact label="Recommendation" value={product.verdict.recommendation} />
              </div>
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>

      <SectionWrapper id="where-to-buy" tone="white" className="scroll-mt-28">
        <SectionHeading
          icon={PackageCheck}
          title={`Where To Buy ${product.name}`}
          subtitle="A dedicated purchase section with official-website guidance, trust reminders, and affiliate disclosure."
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <FadeIn className="rounded-[30px] bg-white/92 p-6 shadow-[0_20px_54px_rgba(15,23,42,0.07)] ring-1 ring-black/5 md:p-8">
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
          <AsideFactCard
            title="Purchase Trust"
            icon={ShieldCheck}
            items={[
              "Use the official website for authenticity and the latest offer details.",
              "Review ingredient transparency before checkout.",
              "Compare alternatives if your goals or routine differ.",
            ]}
          />
        </div>
      </SectionWrapper>

      {product.relatedIngredients.length ? (
        <SectionWrapper id="related-ingredients" className="scroll-mt-28">
          <SectionHeading
            icon={Leaf}
            title="Related Ingredients"
            subtitle="Internal linking support for ingredient-level research, comparison, and topical SEO depth."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {product.relatedIngredients.map((ingredient, index) => (
              <RelatedIngredientCard key={`${ingredient.slug || ingredient.name}-${index}`} ingredient={ingredient} />
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      {product.relatedArticles.length ? (
        <SectionWrapper id="learn-more" tone="white" className="scroll-mt-28">
          <SectionHeading
            icon={BookOpenText}
            title="Learn More"
            subtitle="Related editorial resources connected through matching topics, categories, and ingredient language."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {product.relatedArticles.map((article) => (
              <RelatedArticleCard key={article.slug || article.title} article={article} />
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      {product.comparisonProducts.length ? (
        <SectionWrapper id="compare-alternatives" className="scroll-mt-28">
          <SectionHeading
            icon={PackageCheck}
            title="Compare Alternatives"
            subtitle="A stronger comparison-ready section for visitors who want to evaluate similar products before clicking out."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {product.comparisonProducts.map((item) => (
              <FadeIn
                key={item.slug || item.name}
                className="rounded-[26px] bg-white/92 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
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
                <h3 className="mt-4 font-heading text-xl font-extrabold text-text-dark">{item.name}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.subtitle}</p>
                {item.slug ? (
                  <Link
                    href={`/product/${item.slug}`}
                    className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-bold text-primary transition hover:text-primary/80"
                  >
                    Compare product
                    <ArrowUpRight className="size-4" />
                  </Link>
                ) : null}
              </FadeIn>
            ))}
          </div>
        </SectionWrapper>
      ) : null}

      {product.relatedProducts?.length ? (
        <SectionWrapper id="related-products" tone="white" className="scroll-mt-28">
          <SectionHeading
            icon={PackageCheck}
            title="Related Products"
            subtitle="The current related product carousel remains intact, now sitting inside a stronger long-form review architecture."
          />
          <RelatedProductsSlider products={product.relatedProducts} />
        </SectionWrapper>
      ) : null}

      {product.healthNeeds.length ? (
        <SectionWrapper id="explore-health-needs" className="scroll-mt-28">
          <SectionHeading
            icon={HeartPulse}
            title="Explore By Health Needs"
            subtitle="Premium category cards that keep product readers moving into broader topical journeys."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {product.healthNeeds.map((item, index) => (
              <motion.div
                key={item.slug || item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.04 }}
              >
                <Link
                  href={item.slug ? `/category/${item.slug}` : "/categories"}
                  className="group flex h-full flex-col rounded-[24px] bg-white/92 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.08)]"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
                    <HeartPulse className="size-5" />
                  </span>
                  <h3 className="mt-4 font-heading text-xl font-extrabold text-text-dark">{item.label}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted">{item.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-bold text-primary">
                    Explore category
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      ) : null}
    </main>
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
    <FadeIn className="rounded-[28px] bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] ring-1 ring-black/5 md:p-8">
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

function AsideFactCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof ClipboardList;
  items: string[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <FadeIn className="rounded-[28px] bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-soft-green text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-heading text-xl font-extrabold text-text-dark">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-[18px] bg-cream/60 px-4 py-3 text-sm leading-7 text-muted ring-1 ring-black/5"
          >
            {item}
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-cream/60 px-4 py-3 ring-1 ring-black/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
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

  return (
    <FadeIn className="rounded-[28px] bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-heading text-xl font-extrabold text-text-dark">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-[18px] bg-cream/60 px-4 py-3 text-sm leading-7 text-muted ring-1 ring-black/5"
          >
            <Check className="mt-1 size-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </FadeIn>
  );
}

function VerdictFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-cream/70 px-4 py-4 ring-1 ring-black/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
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
        <h3 className="mt-4 font-heading text-2xl font-extrabold text-text-dark">{ingredient.name}</h3>
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
    <FadeIn className="group relative h-full overflow-hidden rounded-[30px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-premium-hover">
      <Link
        href={`/ingredient/${ingredient.slug}`}
        className="absolute inset-0 z-20 rounded-[30px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        aria-label={`View ${ingredient.name}`}
      />
      <div className="relative z-10">{content}</div>
    </FadeIn>
  ) : (
    <FadeIn className="group relative h-full overflow-hidden rounded-[30px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
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
    <FadeIn className="group relative h-full overflow-hidden rounded-[30px] border border-border-light bg-white shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-premium-hover">
      {article.slug ? (
        <Link
          href={`/blog/${article.slug}`}
          className="absolute inset-0 z-20 rounded-[30px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
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
