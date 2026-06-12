import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeInfo,
  Beaker,
  BookOpenText,
  ChevronRight,
  CircleHelp,
  Leaf,
  MapPin,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TestTube2,
} from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";
import { FAQAccordion } from "@/components/product-detail/FAQAccordion";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { IngredientSectionNav, type IngredientSectionLink } from "@/components/ingredients/IngredientSectionNav";
import { IngredientSmartImage } from "@/components/ingredients/IngredientSmartImage";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { CategoryProduct } from "@/lib/category-data";
import type { FAQItem, Ingredient, JsonValue } from "@/lib/database/types";

export type RelatedIngredientCardData = {
  name: string;
  slug?: string;
  scientificName?: string | null;
  category?: string | null;
  image?: string | null;
  description?: string | null;
};

type TitleDescriptionItem = {
  title: string;
  description: string;
};

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTitleDescriptionItems(
  items: JsonValue[] | undefined,
  fallback: string[] = [],
): TitleDescriptionItem[] {
  if (Array.isArray(items) && items.length) {
    const parsed = items
      .map((item) => {
        if (!isRecord(item)) {
          return null;
        }

        const title = typeof item.title === "string" ? item.title.trim() : "";
        const description =
          typeof item.description === "string" ? item.description.trim() : "";

        if (!title) {
          return null;
        }

        return { title, description };
      })
      .filter(Boolean) as TitleDescriptionItem[];

    if (parsed.length) {
      return parsed;
    }
  }

  return fallback
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({ title: item, description: "" }));
}

function parseStringList(items: JsonValue[] | undefined) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeFaqs(items: FAQItem[]) {
  return (Array.isArray(items) ? items : []).filter(
    (item) => item.question?.trim() && item.answer?.trim(),
  );
}

function splitParagraphs(content?: string | null) {
  if (!content) {
    return [];
  }

  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function extractFlowSteps(content?: string | null) {
  if (!content) {
    return [];
  }

  const bulletLines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (bulletLines.length > 1 && bulletLines.every((line) => /^([-*]|\d+[.)])\s+/.test(line))) {
    return bulletLines.map((line) => line.replace(/^([-*]|\d+[.)])\s+/, "").trim());
  }

  return splitParagraphs(content);
}

function hasVisibleText(value?: string | null) {
  return Boolean(value?.trim());
}

function renderFormattedBlock(block: string, index: number) {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return null;
  }

  const isBulletList = lines.every((line) => /^[-*]\s+/.test(line));
  if (isBulletList) {
    return (
      <ul key={`block-${index}`} className="space-y-3 pl-5 text-base leading-8 text-muted">
        {lines.map((line) => (
          <li key={line} className="list-disc">
            {line.replace(/^[-*]\s+/, "")}
          </li>
        ))}
      </ul>
    );
  }

  const isOrderedList = lines.every((line) => /^\d+[.)]\s+/.test(line));
  if (isOrderedList) {
    return (
      <ol key={`block-${index}`} className="space-y-3 pl-5 text-base leading-8 text-muted">
        {lines.map((line) => (
          <li key={line} className="list-decimal">
            {line.replace(/^\d+[.)]\s+/, "")}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p key={`block-${index}`} className="text-base leading-8 text-muted">
      {block}
    </p>
  );
}

function RichTextContent({ content }: { content?: string | null }) {
  const blocks = splitParagraphs(content);

  if (!blocks.length) {
    return null;
  }

  return <div className="space-y-5">{blocks.map(renderFormattedBlock)}</div>;
}

function buildHeroFacts(ingredient: Ingredient) {
  return [
    { label: "Rating", value: ingredient.rating ? ingredient.rating.toFixed(1) : "", icon: Star },
    { label: "Evidence Level", value: ingredient.evidence_level ?? "", icon: ShieldCheck },
    { label: "Origin Country", value: ingredient.origin_country ?? "", icon: MapPin },
    { label: "Part Used", value: ingredient.part_used ?? "", icon: Leaf },
    { label: "Ingredient Form", value: ingredient.ingredient_form ?? "", icon: Beaker },
    { label: "Taste Profile", value: ingredient.taste_profile ?? "", icon: Sparkles },
  ].filter((item) => item.value);
}

function buildQuickFacts(ingredient: Ingredient) {
  return [
    { label: "Typical Dose", value: ingredient.typical_dose ?? "", icon: Pill },
    { label: "Best For", value: ingredient.best_for ?? "", icon: ShieldCheck },
    { label: "Safety Level", value: ingredient.safety_level ?? "", icon: ShieldAlert },
  ].filter((item) => item.value);
}

export function IngredientDetailTemplate({
  ingredient,
  relatedProducts,
  relatedIngredients,
  relatedArticles,
}: {
  ingredient: Ingredient;
  relatedProducts: CategoryProduct[];
  relatedIngredients: RelatedIngredientCardData[];
  relatedArticles: BlogPostCard[];
}) {
  const heroFacts = buildHeroFacts(ingredient);
  const quickFacts = buildQuickFacts(ingredient);
  const overviewContent =
    ingredient.overview_content || ingredient.full_description || ingredient.short_description;
  const howItWorksContent =
    ingredient.how_it_works_content || ingredient.scientific_notes || null;
  const benefitItems = parseTitleDescriptionItems(
    ingredient.benefits_json,
    ingredient.benefits ?? [],
  );
  const sideEffects = parseTitleDescriptionItems(
    ingredient.side_effects_json,
    ingredient.side_effects ?? [],
  );
  const drugInteractions = parseStringList(ingredient.drug_interactions_json);
  const whoShouldAvoid = parseStringList(ingredient.who_should_avoid_json);
  const faqs = normalizeFaqs(ingredient.faq_json ?? []);
  const howItWorksSteps = extractFlowSteps(howItWorksContent);
  const heroImage = ingredient.image_url || ingredient.featured_image;

  const sections: IngredientSectionLink[] = [
    ...(hasVisibleText(overviewContent) ? [{ id: "overview", label: "Overview" }] : []),
    ...(hasVisibleText(howItWorksContent)
      ? [{ id: "how-it-works", label: "How It Works" }]
      : []),
    ...(benefitItems.length ? [{ id: "benefits", label: "Benefits" }] : []),
    ...(sideEffects.length || drugInteractions.length || whoShouldAvoid.length
      ? [{ id: "safety-information", label: "Safety Information" }]
      : []),
    ...(faqs.length ? [{ id: "faq", label: "FAQ" }] : []),
    ...(relatedProducts.length ? [{ id: "found-in-products", label: "Found In Products" }] : []),
    ...(relatedIngredients.length
      ? [{ id: "related-ingredients", label: "Related Ingredients" }]
      : []),
    ...(relatedArticles.length ? [{ id: "related-articles", label: "Related Articles" }] : []),
  ];

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-cream pb-14 pt-8 md:pb-20 lg:pb-24">
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

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center">
                <div className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_42%)] opacity-80" />
                  <div className="relative h-[300px] md:h-[450px] lg:h-[600px]">
                    <IngredientSmartImage
                      src={heroImage}
                      alt={ingredient.name}
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0D0D1A]/24 via-transparent to-transparent" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-pill border border-primary/12 bg-white px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                        Ingredient Library
                      </span>
                      {ingredient.ingredient_category ? (
                        <span className="inline-flex items-center gap-2 rounded-pill border border-[#8B5CF6]/18 bg-[#8B5CF6]/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                          {ingredient.ingredient_category}
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-3">
                      <h1 className="font-heading text-4xl font-extrabold leading-[1.02] text-text-dark md:text-5xl lg:text-6xl">
                        {ingredient.name}
                      </h1>
                      {ingredient.scientific_name ? (
                        <p className="font-heading text-base italic tracking-[0.03em] text-primary md:text-lg">
                          {ingredient.scientific_name}
                        </p>
                      ) : null}
                    </div>
                    <p className="max-w-3xl text-lg leading-8 text-muted">
                      {ingredient.short_description ||
                        ingredient.seo_description ||
                        "A premium Suppriva ingredient profile for supplement research, safety review, and product discovery."}
                    </p>
                  </div>

                  {heroFacts.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {heroFacts.map((fact, index) => (
                        <FadeIn
                          key={fact.label}
                          delay={0.04 * index}
                          className="h-full rounded-[24px] border border-border-light bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(15,23,42,0.08)]"
                        >
                          <div className="flex h-full items-start gap-3">
                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-soft-green text-primary">
                              <fact.icon className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                                {fact.label}
                              </p>
                              <p className="mt-1 font-heading text-base font-bold text-text-dark">
                                {fact.label === "Rating" ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-gold/10 px-3 py-1 text-sm text-text-dark">
                                    <Star className="size-4 fill-gold text-gold" />
                                    {fact.value}
                                  </span>
                                ) : (
                                  <span
                                    className={
                                      fact.label === "Evidence Level"
                                        ? "inline-flex rounded-pill bg-primary/8 px-3 py-1 text-sm text-primary"
                                        : ""
                                    }
                                  >
                                    {fact.value}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </FadeIn>
                      ))}
                    </div>
                  ) : null}

                  {quickFacts.length ? (
                    <div className="rounded-[28px] border border-border-light bg-white p-5 shadow-[0_20px_54px_rgba(15,23,42,0.06)]">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <BadgeInfo className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                          <h2 className="font-heading text-xl font-extrabold text-text-dark">
                            Quick Facts
                          </h2>
                          <p className="text-sm text-muted">
                            Fast-scan information for research and comparison.
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        {quickFacts.map((fact) => (
                          <div
                            key={fact.label}
                            className="flex h-full rounded-[22px] border border-border-light bg-cream/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                          >
                            <div className="flex items-start gap-3">
                              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
                                <fact.icon className="size-4.5" aria-hidden="true" />
                              </span>
                              <div className="flex min-h-full flex-col">
                                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                                  {fact.label}
                                </p>
                                <p className="mt-2 font-heading text-sm font-bold leading-6 text-text-dark">
                                  {fact.value}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {sections.length ? (
                <div className="xl:hidden">
                  <IngredientSectionNav sections={sections} mobile />
                </div>
              ) : null}
            </div>

            {sections.length ? (
              <aside className="hidden xl:block xl:sticky xl:top-28">
                <IngredientSectionNav sections={sections} />
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      <div className="relative">
        {hasVisibleText(overviewContent) ? (
          <SectionWrapper id="overview" tone="white" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Section 01"
              title="Overview"
              subtitle="A practical medical-style summary of what this ingredient is and how it is commonly used."
            />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <ContentPanel content={overviewContent} />
              <AsideFactCard
                icon={BookOpenText}
                title="Profile Snapshot"
                items={[
                  ingredient.ingredient_category,
                  ingredient.origin_country,
                  ingredient.part_used,
                  ingredient.ingredient_form,
                ].filter(Boolean) as string[]}
              />
            </div>
          </SectionWrapper>
        ) : null}

        {hasVisibleText(howItWorksContent) ? (
          <SectionWrapper id="how-it-works" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Section 02"
              title="How It Works"
              subtitle="The page turns your stored ingredient explanation into a premium visual flow without hardcoded steps."
            />
            <div className="space-y-8">
              {howItWorksSteps.length ? (
                <div className="grid gap-4 lg:grid-cols-3">
                  {howItWorksSteps.map((step, index) => (
                    <FadeIn
                      key={`${index + 1}-${step.slice(0, 24)}`}
                      delay={index * 0.05}
                      className="relative rounded-[28px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
                    >
                      <span className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-primary text-lg font-heading font-extrabold text-white shadow-[0_14px_34px_rgba(11,93,59,0.22)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-base leading-8 text-muted">{step}</p>
                    </FadeIn>
                  ))}
                </div>
              ) : null}
              <ContentPanel content={howItWorksContent} />
            </div>
          </SectionWrapper>
        ) : null}

        {hasVisibleText(ingredient.interesting_fact) ? (
          <SectionWrapper tone="white">
            <FadeIn className="rounded-[32px] border border-gold/18 bg-white p-6 shadow-[0_22px_64px_rgba(15,23,42,0.06)] md:p-8">
              <div className="grid gap-5 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-center">
                <span className="inline-flex size-16 items-center justify-center rounded-full bg-gold/12 text-gold">
                  <Sparkles className="size-7" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    Interesting Fact
                  </p>
                  <p className="mt-3 text-lg leading-8 text-text-dark">
                    {ingredient.interesting_fact}
                  </p>
                </div>
              </div>
            </FadeIn>
          </SectionWrapper>
        ) : null}

        {benefitItems.length ? (
          <SectionWrapper id="benefits" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Section 03"
              title="Benefits"
              subtitle="Responsive benefit cards generated directly from the ingredient record."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {benefitItems.map((benefit, index) => (
                <FadeIn
                  key={benefit.title}
                  delay={index * 0.04}
                  className="h-full rounded-[28px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-primary/18 hover:shadow-[0_26px_60px_rgba(15,23,42,0.09)]"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-soft-green text-primary">
                    <ShieldCheck className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-extrabold text-text-dark">
                    {benefit.title}
                  </h3>
                  {benefit.description ? (
                    <p className="mt-3 text-sm leading-7 text-muted">
                      {benefit.description}
                    </p>
                  ) : null}
                </FadeIn>
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        {sideEffects.length || drugInteractions.length || whoShouldAvoid.length ? (
          <SectionWrapper id="safety-information" tone="white" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Section 04"
              title="Safety Information"
              subtitle="Separate evidence-oriented cards for side effects, interactions, and avoidance notes."
            />
            <div className="grid gap-5 xl:grid-cols-3">
              {sideEffects.length ? (
                <SafetyCard
                  title="Side Effects"
                  icon={ShieldAlert}
                  items={sideEffects.map((item) =>
                    item.description ? `${item.title}: ${item.description}` : item.title,
                  )}
                />
              ) : null}
              {drugInteractions.length ? (
                <SafetyCard
                  title="Drug Interactions"
                  icon={TestTube2}
                  items={drugInteractions}
                />
              ) : null}
              {whoShouldAvoid.length ? (
                <SafetyCard
                  title="Who Should Avoid"
                  icon={CircleHelp}
                  items={whoShouldAvoid}
                />
              ) : null}
            </div>
          </SectionWrapper>
        ) : null}

        {faqs.length ? (
          <SectionWrapper id="faq" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Section 05"
              title="Frequently Asked Questions"
              subtitle="Accordion answers built from the ingredient FAQ data for readers and schema output."
            />
            <div className="mx-auto max-w-4xl rounded-[30px] border border-border-light bg-white/70 p-3 shadow-[0_20px_56px_rgba(15,23,42,0.06)]">
              <FAQAccordion faqs={faqs} />
            </div>
          </SectionWrapper>
        ) : null}

        {relatedProducts.length ? (
          <SectionWrapper id="found-in-products" tone="white" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Section 06"
              title="Found In Products"
              subtitle="Published Suppriva products connected through the existing ingredient relationship table."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((product, index) => (
                <IngredientProductCard
                  key={product.slug}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        {relatedIngredients.length ? (
          <SectionWrapper id="related-ingredients" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Section 07"
              title="Related Ingredients"
              subtitle="Nearby ingredient profiles referenced directly from the ingredient record."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedIngredients.map((item, index) => (
                <RelatedIngredientCard
                  key={`${item.slug || item.name}-${index}`}
                  item={item}
                />
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        {relatedArticles.length ? (
          <SectionWrapper id="related-articles" tone="white" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Section 08"
              title="Related Articles"
              subtitle="Editorial coverage surfaced through the current article relation logic."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedArticles.map((article) => (
                <RelatedArticleCard key={article.slug || article.title} article={article} />
              ))}
            </div>
          </SectionWrapper>
        ) : null}
      </div>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <FadeIn className="mx-auto mb-12 max-w-3xl text-center">
      <p className="font-heading text-xs font-bold uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted">
        {subtitle}
      </p>
    </FadeIn>
  );
}

function ContentPanel({ content }: { content?: string | null }) {
  if (!hasVisibleText(content)) {
    return null;
  }

  return (
    <FadeIn className="rounded-[32px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)] md:p-8">
      <RichTextContent content={content} />
    </FadeIn>
  );
}

function AsideFactCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof BookOpenText;
  title: string;
  items: string[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <FadeIn className="rounded-[32px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-soft-green text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-heading text-xl font-extrabold text-text-dark">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-[18px] border border-border-light bg-cream/60 px-4 py-3 text-sm leading-6 text-muted"
          >
            {item}
          </div>
        ))}
      </div>
    </FadeIn>
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
  return (
    <FadeIn className="rounded-[30px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)]">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-soft-green text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-heading text-xl font-extrabold text-text-dark">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-[18px] border border-border-light bg-cream/60 px-4 py-3 text-sm leading-7 text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
    </FadeIn>
  );
}

function IngredientProductCard({
  product,
  priority,
}: {
  product: CategoryProduct;
  priority?: boolean;
}) {
  return (
    <FadeIn className="group relative h-full overflow-hidden rounded-[30px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-premium-hover">
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-20 rounded-[30px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        aria-label={`View ${product.name}`}
      />
      <div className="relative h-[220px] overflow-hidden rounded-[24px] bg-gradient-to-br from-soft-green to-gold/[0.16]">
        <Image
          src={product.image || "/assets/hero-supplements.webp"}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-contain p-5 transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="relative z-10 mt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold/24 bg-gold/10 px-3 py-1.5 font-heading text-sm font-semibold text-text-dark">
            <Star className="size-4 fill-gold text-gold" />
            {product.rating}
          </span>
        </div>
        <h3 className="mt-4 font-heading text-2xl font-extrabold text-text-dark">
          {product.name}
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted">{product.description}</p>
        <span className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary">
          View product
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </FadeIn>
  );
}

function RelatedIngredientCard({ item }: { item: RelatedIngredientCardData }) {
  const wrapperClasses =
    "group relative h-full overflow-hidden rounded-[28px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-premium-hover";
  const content = (
    <>
      <div className="relative h-[210px] overflow-hidden rounded-[24px] bg-gradient-to-br from-white to-soft-green">
        <IngredientSmartImage
          src={item.image}
          alt={item.name}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="group-hover:scale-105"
        />
      </div>
      <div className="mt-5">
        {item.category ? (
          <span className="rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary">
            {item.category}
          </span>
        ) : null}
        <h3 className="mt-4 font-heading text-2xl font-extrabold text-text-dark">
          {item.name}
        </h3>
        {item.scientificName ? (
          <p className="mt-2 text-sm italic text-primary">{item.scientificName}</p>
        ) : null}
        {item.description ? (
          <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
        ) : null}
        {item.slug ? (
          <span className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary">
            Explore ingredient
            <ArrowUpRight className="size-4" />
          </span>
        ) : null}
      </div>
    </>
  );

  return item.slug ? (
    <FadeIn className={wrapperClasses}>
      <Link
        href={`/ingredient/${item.slug}`}
        className="absolute inset-0 z-20 rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        aria-label={`View ${item.name}`}
      />
      <div className="relative z-10">{content}</div>
    </FadeIn>
  ) : (
    <FadeIn className={wrapperClasses}>{content}</FadeIn>
  );
}

function RelatedArticleCard({ article }: { article: BlogPostCard }) {
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
