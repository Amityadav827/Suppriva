import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeInfo,
  Beaker,
  Check,
  BookOpenText,
  ChevronRight,
  CircleHelp,
  HelpCircle,
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
import { IngredientFAQAccordion } from "@/components/ingredients/IngredientFAQAccordion";
import { IngredientSectionNav, type IngredientSectionLink } from "@/components/ingredients/IngredientSectionNav";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import type { CategoryProduct } from "@/lib/category-data";
import type {
  ExpertAttribution,
  FAQItem,
  Ingredient,
  IngredientLayoutSection,
  JsonValue,
} from "@/lib/database/types";
import {
  INGREDIENT_LAYOUT_SECTION_DEFINITIONS,
  getIngredientLayoutDefinition,
} from "@/lib/ingredient-layout";
import { getCategoryIcon } from "@/lib/live-data";
import { cn } from "@/lib/utils";

export type RelatedIngredientCardData = {
  name: string;
  slug?: string;
  scientificName?: string | null;
  category?: string | null;
  image?: string | null;
  description?: string | null;
};

type TitleDescriptionItem = {
  icon?: string;
  title: string;
  description: string;
};

type HealthNeedLink = {
  label: string;
  slug: string;
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
        const icon = typeof item.icon === "string" ? item.icon.trim() : "";

        if (!title) {
          return null;
        }

        return { icon, title, description };
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

function getCmsIcon(icon: string | undefined, fallback: typeof ShieldCheck = ShieldCheck) {
  const normalizedIcon = icon?.trim().toLowerCase();

  if (!normalizedIcon) {
    return fallback;
  }

  const iconMap = new Map<string, typeof ShieldCheck>([
    ["activity", Activity],
    ["badge-info", BadgeInfo],
    ["beaker", Beaker],
    ["book", BookOpenText],
    ["book-open", BookOpenText],
    ["check", Check],
    ["help", CircleHelp],
    ["info", BadgeInfo],
    ["leaf", Leaf],
    ["map-pin", MapPin],
    ["pill", Pill],
    ["shield", ShieldCheck],
    ["shield-alert", ShieldAlert],
    ["shield-check", ShieldCheck],
    ["sparkles", Sparkles],
    ["star", Star],
    ["test-tube", TestTube2],
  ]);

  return iconMap.get(normalizedIcon) ?? fallback;
}

function parseIngredientLayoutSections(value: Ingredient["ingredient_layout_sections"]) {
  if (!Array.isArray(value)) {
    return new Map<string, IngredientLayoutSection>();
  }

  return new Map(
    value
      .filter((item): item is IngredientLayoutSection => {
        return Boolean(item && typeof item.section_key === "string");
      })
      .map((item) => [item.section_key, item]),
  );
}

function getSectionSettings(
  layoutMap: Map<string, IngredientLayoutSection>,
  sectionKey: IngredientLayoutSection["section_key"],
) {
  const definition = getIngredientLayoutDefinition(sectionKey);
  const saved = layoutMap.get(sectionKey);

  return {
    visible: saved?.is_visible ?? true,
    order:
      saved?.sort_order ??
      (definition
        ? INGREDIENT_LAYOUT_SECTION_DEFINITIONS.findIndex((item) => item.key === definition.key)
        : 0),
    title: saved?.title_override?.trim() || definition?.defaultTitle || "",
    subtitle: saved?.subtitle_override?.trim() || definition?.defaultSubtitle || "",
  };
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

function splitIntoColumns<T>(items: T[], columns: number) {
  return Array.from({ length: columns }, (_, columnIndex) =>
    items.filter((_, itemIndex) => itemIndex % columns === columnIndex),
  ).filter((column) => column.length);
}

function formatLastUpdated(value?: string | null) {
  if (!value) {
    return "Recently updated";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
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
  const normalizedContent = content?.trim() ?? "";

  if (looksLikeHtml(normalizedContent)) {
    return (
      <div
        className="space-y-5 text-base leading-8 text-muted [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:decoration-gold/50 [&_a]:underline-offset-4 [&_blockquote]:rounded-[24px] [&_blockquote]:border [&_blockquote]:border-gold/24 [&_blockquote]:bg-gold/10 [&_blockquote]:p-5 [&_blockquote]:text-text-dark [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-text-dark [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-text-dark [&_li]:leading-8 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:leading-8 [&_strong]:text-text-dark [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(normalizedContent) }}
      />
    );
  }

  const blocks = splitParagraphs(content);

  if (!blocks.length) {
    return null;
  }

  return <div className="space-y-5">{blocks.map(renderFormattedBlock)}</div>;
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function sanitizeRichHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=["'][^"']*["']/gi, "")
    .replace(/\shref=["']javascript:[^"']*["']/gi, ' href="#"')
    .replace(/\ssrc=["']javascript:[^"']*["']/gi, "");
}

function buildQuickFacts(ingredient: Ingredient) {
  return [
    { label: "Type", value: ingredient.ingredient_category || "Not specified", icon: Leaf },
    { label: "Typical Dose", value: ingredient.typical_dose || "Not specified", icon: Pill },
    { label: "Best For", value: ingredient.best_for || "Not specified", icon: ShieldCheck },
    { label: "Safety Level", value: ingredient.safety_level || "Not specified", icon: ShieldAlert },
    { label: "Origin", value: ingredient.origin_country || "Not specified", icon: MapPin },
    { label: "Part Used", value: ingredient.part_used || "Not specified", icon: Leaf },
    { label: "Form", value: ingredient.ingredient_form || "Not specified", icon: Beaker },
    { label: "Taste", value: ingredient.taste_profile || "Not specified", icon: Sparkles },
  ];
}

function getSidebarQuickFactIcon(label: string) {
  const normalizedLabel = label.trim().toLowerCase();

  if (normalizedLabel.includes("dose")) return Pill;
  if (normalizedLabel.includes("safety")) return ShieldAlert;
  if (normalizedLabel.includes("origin")) return MapPin;
  if (normalizedLabel.includes("form")) return Beaker;
  if (normalizedLabel.includes("taste")) return Sparkles;
  if (normalizedLabel.includes("best")) return ShieldCheck;

  return BadgeInfo;
}

function parseSidebarQuickFacts(ingredient: Ingredient) {
  const cmsFacts = Array.isArray(ingredient.sidebar_quick_facts_json)
    ? ingredient.sidebar_quick_facts_json
        .map((item) => ({
          label: typeof item.label === "string" ? item.label.trim() : "",
          value: typeof item.value === "string" ? item.value.trim() : "",
          icon: getSidebarQuickFactIcon(typeof item.label === "string" ? item.label : ""),
        }))
        .filter((item) => item.label && item.value)
    : [];

  return cmsFacts.length ? cmsFacts : buildQuickFacts(ingredient);
}

export function IngredientDetailTemplate(props: {
  ingredient: Ingredient;
  expertAttribution: ExpertAttribution;
  relatedProducts: CategoryProduct[];
  relatedIngredients: RelatedIngredientCardData[];
  relatedArticles: BlogPostCard[];
  compareAlternatives: RelatedIngredientCardData[];
  healthNeeds: HealthNeedLink[];
}) {
  const {
    ingredient,
    relatedProducts,
    relatedIngredients,
    relatedArticles,
    compareAlternatives,
    healthNeeds,
  } = props;
  const layoutMap = parseIngredientLayoutSections(ingredient.ingredient_layout_sections);
  const overviewSection = getSectionSettings(layoutMap, "overview");
  const howItWorksSection = getSectionSettings(layoutMap, "how_it_works");
  const benefitsSection = getSectionSettings(layoutMap, "benefits");
  const usesSection = getSectionSettings(layoutMap, "uses");
  const foodSourcesSection = getSectionSettings(layoutMap, "food_sources");
  const dosageSection = getSectionSettings(layoutMap, "dosage");
  const safetySection = getSectionSettings(layoutMap, "safety");
  const researchSection = getSectionSettings(layoutMap, "research");
  const referencesSection = getSectionSettings(layoutMap, "references");
  const faqSection = getSectionSettings(layoutMap, "faq");
  const quickFacts = parseSidebarQuickFacts(ingredient);
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
  const useItems = parseTitleDescriptionItems(ingredient.uses_json);
  const foodSourceItems = parseTitleDescriptionItems(ingredient.food_sources_json);
  const researchItems = parseTitleDescriptionItems(ingredient.research_json);
  const referenceItems = parseTitleDescriptionItems(ingredient.references_json);
  const faqs = normalizeFaqs(ingredient.faq_json ?? []);
  const howItWorksHighlight =
    ingredient.how_it_works_highlight_title && ingredient.how_it_works_highlight_description
      ? {
          title: ingredient.how_it_works_highlight_title,
          description: ingredient.how_it_works_highlight_description,
        }
      : null;
  const howItWorksSteps = extractFlowSteps(howItWorksContent);
  const faqColumns = splitIntoColumns(faqs, 2);
  const atAGlanceItems = [
    { label: "Evidence Level", value: ingredient.evidence_level || "Not specified" },
    { label: "Found In Products", value: String(relatedProducts.length) },
    { label: "Related Ingredients", value: String(relatedIngredients.length) },
    { label: "Last Updated", value: formatLastUpdated(ingredient.updated_at) },
  ];
  const profileSnapshotTitle = ingredient.sidebar_profile_title || "Profile Snapshot";
  const profileSnapshotContent = hasVisibleText(ingredient.sidebar_profile_content)
    ? ingredient.sidebar_profile_content
    : null;
  const profileSnapshotItems = [
    ingredient.ingredient_category,
    ingredient.origin_country,
    ingredient.part_used,
    ingredient.ingredient_form,
  ].filter(Boolean) as string[];
  const atAGlanceContent = hasVisibleText(ingredient.sidebar_at_a_glance_content)
    ? ingredient.sidebar_at_a_glance_content
    : null;

  const sections: IngredientSectionLink[] = [
    ...(overviewSection.visible && hasVisibleText(overviewContent)
      ? [{ id: "overview", label: overviewSection.title, order: overviewSection.order }]
      : []),
    ...(howItWorksSection.visible && hasVisibleText(howItWorksContent)
      ? [{ id: "how-it-works", label: howItWorksSection.title, order: howItWorksSection.order }]
      : []),
    ...(benefitsSection.visible && benefitItems.length
      ? [{ id: "benefits", label: benefitsSection.title, order: benefitsSection.order }]
      : []),
    ...(usesSection.visible && (hasVisibleText(ingredient.uses_content) || useItems.length)
      ? [{ id: "uses", label: usesSection.title, order: usesSection.order }]
      : []),
    ...(foodSourcesSection.visible &&
    (hasVisibleText(ingredient.food_sources_content) || foodSourceItems.length)
      ? [{ id: "food-sources", label: foodSourcesSection.title, order: foodSourcesSection.order }]
      : []),
    ...(dosageSection.visible && (hasVisibleText(ingredient.dosage_content) || hasVisibleText(ingredient.dosage))
      ? [{ id: "dosage", label: dosageSection.title, order: dosageSection.order }]
      : []),
    ...(safetySection.visible &&
    (sideEffects.length || drugInteractions.length || whoShouldAvoid.length)
      ? [{ id: "safety-information", label: safetySection.title, order: safetySection.order }]
      : []),
    ...(researchSection.visible && (hasVisibleText(ingredient.research_content) || researchItems.length)
      ? [{ id: "research", label: researchSection.title, order: researchSection.order }]
      : []),
    ...(referencesSection.visible && referenceItems.length
      ? [{ id: "references", label: referencesSection.title, order: referencesSection.order }]
      : []),
    ...(faqSection.visible && faqs.length ? [{ id: "faq", label: faqSection.title, order: faqSection.order }] : []),
    ...(relatedProducts.length ? [{ id: "found-in-products", label: "Found In Products", order: 100 }] : []),
    ...(relatedIngredients.length
      ? [{ id: "related-ingredients", label: "Related Ingredients", order: 101 }]
      : []),
    ...(relatedArticles.length ? [{ id: "related-blogs", label: "Related Blogs", order: 102 }] : []),
    ...(compareAlternatives.length
      ? [{ id: "compare-alternatives", label: "Compare Alternatives", order: 103 }]
      : []),
    ...(healthNeeds.length ? [{ id: "explore-health-needs", label: "Explore Health Needs", order: 104 }] : []),
  ];

  return (
    <main>
      <section className="relative isolate bg-cream py-12 md:py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_22%,rgba(234,244,236,0.55)_0%,rgba(247,246,242,0)_31%),radial-gradient(circle_at_84%_30%,rgba(217,165,32,0.1)_0%,rgba(247,246,242,0)_28%)]"
        />
        <div className="site-container">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
            <div className="relative flex flex-col gap-8">
        <div className="ingredient-detail-hero space-y-8 rounded-[30px] bg-white/92 p-8 shadow-[0_18px_52px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-muted"
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

          <div className="max-w-4xl">
            <div className="space-y-6">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {ingredient.hero_badge ? (
                    <span className="inline-flex items-center gap-2 rounded-pill border border-gold/24 bg-gold/12 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                      {ingredient.hero_badge}
                    </span>
                  ) : null}
                  {ingredient.ingredient_category ? (
                    <span className="inline-flex items-center gap-2 rounded-pill border border-[#8B5CF6]/18 bg-[#8B5CF6]/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                      {ingredient.ingredient_category}
                    </span>
                  ) : null}
                  {ingredient.rating ? (
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-sm font-bold text-text-dark">
                      <Star className="size-4 fill-gold text-gold" />
                      {ingredient.rating.toFixed(1)}
                    </span>
                  ) : null}
                  {ingredient.evidence_level ? (
                    <span className="inline-flex rounded-pill bg-primary/8 px-3 py-1.5 font-heading text-sm font-bold text-primary">
                      {ingredient.evidence_level}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3">
                  <h1 className="font-heading text-5xl font-extrabold leading-[0.98] text-text-dark md:text-6xl xl:text-[4.5rem]">
                    {ingredient.name}
                  </h1>
                  {ingredient.scientific_name ? (
                    <p className="font-heading text-lg italic tracking-[0.04em] text-primary md:text-xl">
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
            </div>
          </div>
        </div>

        {overviewSection.visible && hasVisibleText(overviewContent) ? (
          <SectionWrapper id="overview" tone="white" className="scroll-mt-28" style={{ order: overviewSection.order }}>
            <SectionHeading
              icon={Leaf}
              title={ingredient.overview_title || overviewSection.title}
              subtitle={ingredient.overview_subtitle || overviewSection.subtitle}
            />
            <ContentPanel content={overviewContent} />
          </SectionWrapper>
        ) : null}

        {howItWorksSection.visible && hasVisibleText(howItWorksContent) ? (
          <SectionWrapper id="how-it-works" className="scroll-mt-28" style={{ order: howItWorksSection.order }}>
            <SectionHeading
              icon={BadgeInfo}
              title={ingredient.how_it_works_title || howItWorksSection.title}
              subtitle={ingredient.how_it_works_subtitle || howItWorksSection.subtitle}
            />
            <div className="space-y-8">
              {howItWorksHighlight ? (
                <div className="overflow-hidden rounded-[28px] bg-white/92 p-5 shadow-[0_18px_52px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
                  <FadeIn className="rounded-[24px] bg-cream/70 p-5 ring-1 ring-black/5">
                    <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-white text-primary shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                      <BadgeInfo className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-heading text-xl font-extrabold text-text-dark">
                      {howItWorksHighlight.title}
                    </h3>
                    <div className="mt-3 text-sm leading-7 text-text-dark">
                      <RichTextContent content={howItWorksHighlight.description} />
                    </div>
                  </FadeIn>
                </div>
              ) : howItWorksSteps.length ? (
                <div className="overflow-hidden rounded-[28px] bg-white/92 p-5 shadow-[0_18px_52px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
                  <div className="grid gap-4 lg:grid-cols-[repeat(5,minmax(0,1fr))] lg:items-center">
                    {howItWorksSteps.map((step, index) => (
                      <FadeIn
                        key={`${index + 1}-${step.slice(0, 24)}`}
                        delay={index * 0.05}
                        className="relative rounded-[24px] bg-cream/70 p-5 ring-1 ring-black/5"
                      >
                        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-white text-primary shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                          <BadgeInfo className="size-5" aria-hidden="true" />
                        </span>
                        <p className="text-sm leading-7 text-text-dark">{step}</p>
                        {index < howItWorksSteps.length - 1 ? (
                          <span className="absolute right-[-12px] top-1/2 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_8px_18px_rgba(15,23,42,0.08)] lg:inline-flex">
                            <ArrowUpRight className="size-3.5 rotate-45" aria-hidden="true" />
                          </span>
                        ) : null}
                      </FadeIn>
                    ))}
                  </div>
                </div>
              ) : null}
              <ContentPanel content={howItWorksContent} />
            </div>
          </SectionWrapper>
        ) : null}

        {overviewSection.visible && hasVisibleText(ingredient.interesting_fact) ? (
          <SectionWrapper tone="white" style={{ order: overviewSection.order }}>
            <FadeIn className="rounded-[32px] border border-gold/18 bg-white p-6 shadow-[0_22px_64px_rgba(15,23,42,0.06)] md:p-8">
              <div className="grid gap-5 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-center">
                <span className="inline-flex size-16 items-center justify-center rounded-full bg-gold/12 text-gold">
                  <Sparkles className="size-7" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    {ingredient.interesting_fact_label || "Interesting Fact"}
                  </p>
                  <div className="mt-3 text-lg leading-8 text-text-dark">
                    <RichTextContent content={ingredient.interesting_fact} />
                  </div>
                </div>
              </div>
            </FadeIn>
          </SectionWrapper>
        ) : null}

        {benefitsSection.visible && benefitItems.length ? (
          <SectionWrapper id="benefits" className="scroll-mt-28" style={{ order: benefitsSection.order }}>
            <SectionHeading
              icon={ShieldCheck}
              title={ingredient.benefits_title || benefitsSection.title}
              subtitle={ingredient.benefits_subtitle || benefitsSection.subtitle}
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {benefitItems.map((benefit, index) => (
                <BenefitCard key={benefit.title} benefit={benefit} index={index} />
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        {usesSection.visible && (hasVisibleText(ingredient.uses_content) || useItems.length) ? (
          <SectionWrapper id="uses" tone="white" className="scroll-mt-28" style={{ order: usesSection.order }}>
            <SectionHeading
              icon={Sparkles}
              title={ingredient.uses_title || usesSection.title}
              subtitle={ingredient.uses_subtitle || usesSection.subtitle}
            />
            <div className="space-y-6">
              <ContentPanel content={ingredient.uses_content} />
              {useItems.length ? (
                <InfoCardGrid items={useItems} icon={Sparkles} />
              ) : null}
            </div>
          </SectionWrapper>
        ) : null}

        {foodSourcesSection.visible &&
        (hasVisibleText(ingredient.food_sources_content) || foodSourceItems.length) ? (
          <SectionWrapper id="food-sources" className="scroll-mt-28" style={{ order: foodSourcesSection.order }}>
            <SectionHeading
              icon={Leaf}
              title={ingredient.food_sources_title || foodSourcesSection.title}
              subtitle={ingredient.food_sources_subtitle || foodSourcesSection.subtitle}
            />
            <div className="space-y-6">
              <ContentPanel content={ingredient.food_sources_content} />
              {foodSourceItems.length ? (
                <InfoCardGrid items={foodSourceItems} icon={Leaf} />
              ) : null}
            </div>
          </SectionWrapper>
        ) : null}

        {dosageSection.visible &&
        (hasVisibleText(ingredient.dosage_content) || hasVisibleText(ingredient.dosage)) ? (
          <SectionWrapper id="dosage" tone="white" className="scroll-mt-28" style={{ order: dosageSection.order }}>
            <SectionHeading
              icon={Pill}
              title={ingredient.dosage_title || dosageSection.title}
              subtitle={ingredient.dosage_subtitle || dosageSection.subtitle}
            />
            <ContentPanel content={ingredient.dosage_content || ingredient.dosage} />
          </SectionWrapper>
        ) : null}

        {safetySection.visible &&
        (sideEffects.length || drugInteractions.length || whoShouldAvoid.length) ? (
          <SectionWrapper id="safety-information" tone="white" className="scroll-mt-28" style={{ order: safetySection.order }}>
            <SectionHeading
              icon={ShieldAlert}
              title={ingredient.safety_title || safetySection.title}
              subtitle={ingredient.safety_subtitle || safetySection.subtitle}
            />
            <div className="grid gap-5 xl:grid-cols-3">
              {sideEffects.length ? (
                <SafetyCard
                  title="Side Effects"
                  icon={ShieldAlert}
                  items={sideEffects.map((item) => item.description || item.title)}
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

        {researchSection.visible && (hasVisibleText(ingredient.research_content) || researchItems.length) ? (
          <SectionWrapper id="research" className="scroll-mt-28" style={{ order: researchSection.order }}>
            <SectionHeading
              icon={TestTube2}
              title={ingredient.research_title || researchSection.title}
              subtitle={ingredient.research_subtitle || researchSection.subtitle}
            />
            <div className="space-y-6">
              <ContentPanel content={ingredient.research_content} />
              {researchItems.length ? (
                <InfoCardGrid items={researchItems} icon={TestTube2} />
              ) : null}
            </div>
          </SectionWrapper>
        ) : null}

        {referencesSection.visible && referenceItems.length ? (
          <SectionWrapper id="references" tone="white" className="scroll-mt-28" style={{ order: referencesSection.order }}>
            <SectionHeading
              icon={BookOpenText}
              title={ingredient.references_title || referencesSection.title}
              subtitle={ingredient.references_subtitle || referencesSection.subtitle}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {referenceItems.map((reference, index) => (
                <FadeIn
                  key={`${reference.title}-${index}`}
                  delay={index * 0.04}
                  className="rounded-[22px] bg-white/92 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.05)] ring-1 ring-black/5"
                >
                  <p className="font-heading text-lg font-extrabold text-text-dark">
                    {reference.title}
                  </p>
                  {reference.description ? (
                    <p className="mt-2 text-sm leading-7 text-muted">{reference.description}</p>
                  ) : null}
                </FadeIn>
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        {faqSection.visible && faqs.length ? (
          <SectionWrapper id="faq" className="scroll-mt-28" style={{ order: faqSection.order }}>
            <SectionHeading
              icon={HelpCircle}
              title={ingredient.faq_title || faqSection.title}
              subtitle={ingredient.faq_subtitle || faqSection.subtitle}
              actionHref="/ingredients"
              actionLabel="View All FAQs"
            />
            <div className="grid gap-5 xl:grid-cols-2">
              {faqColumns.map((column, index) => (
                <div
                  key={`faq-column-${index + 1}`}
                  className="rounded-[28px] bg-white/70 p-3 shadow-[0_20px_56px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
                >
                  <IngredientFAQAccordion faqs={column} />
                </div>
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        {relatedProducts.length ? (
          <SectionWrapper id="found-in-products" tone="white" className="scroll-mt-28" style={{ order: 100 }}>
            <SectionHeading
              icon={Pill}
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
          <SectionWrapper id="related-ingredients" className="scroll-mt-28" style={{ order: 101 }}>
            <SectionHeading
              icon={Leaf}
              title="Related Ingredients"
              subtitle="Automatically matched ingredient profiles with similar wellness context."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedIngredients.map((item, index) => (
                <RelatedIngredientTextCard
                  key={`${item.slug || item.name}-${index}`}
                  item={item}
                />
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        {relatedArticles.length ? (
          <SectionWrapper id="related-blogs" tone="white" className="scroll-mt-28" style={{ order: 102 }}>
            <SectionHeading
              icon={BookOpenText}
              title="Related Blogs"
              subtitle="Editorial resources automatically matched by ingredient, category, and wellness topic language."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedArticles.map((article) => (
                <RelatedArticleCard key={article.slug || article.title} article={article} />
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        {compareAlternatives.length ? (
          <SectionWrapper id="compare-alternatives" className="scroll-mt-28" style={{ order: 103 }}>
            <SectionHeading
              icon={TestTube2}
              title="Compare Alternatives"
              subtitle="Similar ingredients surfaced automatically from matching wellness categories and ingredient language."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {compareAlternatives.map((item, index) => (
                <RelatedIngredientCard
                  key={`${item.slug || item.name}-compare-${index}`}
                  item={item}
                />
              ))}
            </div>
          </SectionWrapper>
        ) : null}

        {healthNeeds.length ? (
          <SectionWrapper id="explore-health-needs" tone="white" className="scroll-mt-28" style={{ order: 104 }}>
            <SectionHeading
              icon={ShieldCheck}
              title="Explore By Health Needs"
              subtitle="Browse live wellness categories connected to broader supplement goals."
            />
            <div className="flex flex-wrap justify-center gap-4">
              {healthNeeds.map((category) => (
                <HealthNeedPill key={category.slug} category={category} />
              ))}
            </div>
          </SectionWrapper>
        ) : null}
            </div>

            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              {sections.length ? <IngredientSectionNav sections={sections} /> : null}
              <AsideFactCard
                icon={BookOpenText}
                title={profileSnapshotTitle}
                content={profileSnapshotContent}
                items={profileSnapshotItems}
              />
              {quickFacts.length ? <QuickFactsSidebar facts={quickFacts} /> : null}
              {atAGlanceContent || atAGlanceItems.length ? (
                <FadeIn className="rounded-[28px] bg-white/92 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
                  <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    At A Glance
                  </p>
                  {atAGlanceContent ? (
                    <div className="mt-5 text-sm leading-7 text-muted">
                      <RichTextContent content={atAGlanceContent} />
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {atAGlanceItems.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-4 border-b border-black/6 pb-3 last:border-b-0 last:pb-0"
                        >
                          <span className="text-sm font-medium text-muted">
                            {item.label}
                          </span>
                          <span className="text-right text-sm font-semibold text-text-dark">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link
                    href="/ingredients"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-heading text-sm font-bold text-white transition hover:bg-primary/90"
                  >
                    Browse All Ingredients
                    <ArrowUpRight className="size-4" />
                  </Link>
                </FadeIn>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function HealthNeedPill({ category }: { category: HealthNeedLink }) {
  const Icon = getCategoryIcon(category.label);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex min-h-14 items-center justify-center gap-2 rounded-pill border border-primary/10 bg-soft-green px-4 py-3 text-center shadow-[0_12px_34px_rgba(6,57,33,0.06)] transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-[#dceee1] hover:shadow-[0_18px_46px_rgba(6,57,33,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:justify-start md:px-5"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-primary shadow-[0_8px_20px_rgba(6,57,33,0.08)] transition duration-300 group-hover:text-dark-green">
        <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <span className="font-heading text-xs font-semibold leading-4 text-text-dark sm:text-sm">
        {category.label}
      </span>
    </Link>
  );
}

type IngredientSectionWrapperProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "cream" | "white";
  style?: CSSProperties;
};

function SectionWrapper({
  id,
  children,
  className,
  tone = "cream",
  style,
}: IngredientSectionWrapperProps) {
  return (
    <section
      id={id}
      style={style}
      className={cn(
        "relative isolate overflow-hidden rounded-[30px] p-8 shadow-[0_18px_52px_rgba(15,23,42,0.06)] ring-1 ring-black/5",
        tone === "cream" ? "bg-cream" : "bg-white",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_22%,rgba(234,244,236,0.82)_0%,rgba(247,246,242,0)_31%),radial-gradient(circle_at_84%_30%,rgba(217,165,32,0.14)_0%,rgba(247,246,242,0)_28%)]"
      />
      <span
        aria-hidden="true"
        className="absolute left-4 top-20 -z-10 h-20 w-10 rotate-[-32deg] rounded-[100%_0_100%_0] bg-primary/8 blur-[1px] md:left-10 md:h-28 md:w-14"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-20 right-6 -z-10 h-24 w-12 rotate-[36deg] rounded-[100%_0_100%_0] bg-gold/10 blur-[1px] md:right-16 md:h-32 md:w-16"
      />
      {children}
    </section>
  );
}

function QuickFactsSidebar({ facts }: { facts: ReturnType<typeof buildQuickFacts> }) {
  return (
    <FadeIn className="rounded-[28px] bg-white/92 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BadgeInfo className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-extrabold text-text-dark">
            Quick Facts
          </h2>
          <p className="text-xs text-muted">Fast comparison fields for research.</p>
        </div>
      </div>
      <div className="space-y-3">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex items-start gap-3 rounded-[20px] bg-cream/80 px-4 py-4 ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
              <fact.icon className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {fact.label}
              </p>
              <p className="mt-1 font-heading text-sm font-bold leading-6 text-text-dark">
                {fact.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
  actionHref,
  actionLabel,
}: {
  icon: typeof Leaf;
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <FadeIn className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col items-start gap-3 md:flex-row md:items-start md:gap-4">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_14px_36px_rgba(15,23,42,0.08)] ring-1 ring-black/5">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-base leading-7 text-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 self-start font-heading text-sm font-bold text-primary transition hover:text-primary/80"
        >
          {actionLabel}
          <ArrowUpRight className="size-4" />
        </Link>
      ) : null}
    </FadeIn>
  );
}

function InfoCardGrid({
  items,
  icon: Icon,
}: {
  items: TitleDescriptionItem[];
  icon: typeof Leaf;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <FadeIn
          key={`${item.title}-${index}`}
          delay={index * 0.04}
          className="h-full rounded-[24px] bg-white/92 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.08)]"
        >
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-heading text-xl font-extrabold text-text-dark">
            {item.title}
          </h3>
          {item.description ? (
            <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
          ) : null}
        </FadeIn>
      ))}
    </div>
  );
}

function BenefitCard({
  benefit,
  index,
}: {
  benefit: TitleDescriptionItem;
  index: number;
}) {
  const Icon = getCmsIcon(benefit.icon, ShieldCheck);

  return (
    <FadeIn
      delay={index * 0.04}
      className="h-full rounded-[24px] bg-white/92 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.08)]"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-soft-green/70 text-primary">
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
}

function ContentPanel({ content }: { content?: string | null }) {
  if (!hasVisibleText(content)) {
    return null;
  }

  return (
    <FadeIn className="rounded-[28px] bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] ring-1 ring-black/5 md:p-8">
      <RichTextContent content={content} />
    </FadeIn>
  );
}

function AsideFactCard({
  icon: Icon,
  title,
  items,
  content,
}: {
  icon: typeof BookOpenText;
  title: string;
  items: string[];
  content?: string | null;
}) {
  if (!items.length && !hasVisibleText(content)) {
    return null;
  }

  return (
    <FadeIn className="rounded-[28px] bg-white/92 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-soft-green text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-heading text-xl font-extrabold text-text-dark">{title}</h3>
      {hasVisibleText(content) ? (
        <div className="mt-5 text-sm leading-7 text-muted">
          <RichTextContent content={content} />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-[18px] bg-cream/60 px-4 py-3 text-sm leading-6 text-muted ring-1 ring-black/5"
            >
              {item}
            </div>
          ))}
        </div>
      )}
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
            <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{item}</span>
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
        href={product.href || `/product/${product.slug}`}
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

function RelatedIngredientTextCard({ item }: { item: RelatedIngredientCardData }) {
  const wrapperClasses =
    "group relative flex min-h-[280px] h-full flex-col overflow-hidden rounded-[28px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-premium-hover";
  const content = (
    <div className="flex h-full flex-col">
      {item.category ? (
        <span className="w-fit rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary">
          {item.category}
        </span>
      ) : null}
      <h3 className="mt-5 font-heading text-2xl font-extrabold leading-tight text-text-dark">
        {item.name}
      </h3>
      {item.scientificName ? (
        <p className="mt-2 text-sm italic text-primary">{item.scientificName}</p>
      ) : null}
      {item.description ? (
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted">{item.description}</p>
      ) : null}
      {item.slug ? (
        <span className="mt-auto inline-flex items-center gap-2 pt-6 font-heading text-sm font-semibold text-primary">
          Read More
          <ArrowUpRight className="size-4" />
        </span>
      ) : null}
    </div>
  );

  return item.slug ? (
    <FadeIn className={wrapperClasses}>
      <Link
        href={`/ingredient/${item.slug}`}
        className="absolute inset-0 z-20 rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        aria-label={`View ${item.name}`}
      />
      <div className="relative z-10 flex h-full flex-col">{content}</div>
    </FadeIn>
  ) : (
    <FadeIn className={wrapperClasses}>{content}</FadeIn>
  );
}

function RelatedIngredientCard({ item }: { item: RelatedIngredientCardData }) {
  const wrapperClasses =
    "group relative flex min-h-[280px] h-full flex-col overflow-hidden rounded-[28px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-premium-hover";
  const content = (
    <div className="flex h-full flex-col">
      {item.category ? (
        <span className="w-fit rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary">
          {item.category}
        </span>
      ) : null}
      <h3 className="mt-5 font-heading text-2xl font-extrabold leading-tight text-text-dark">
        {item.name}
      </h3>
      {item.scientificName ? (
        <p className="mt-2 text-sm italic text-primary">{item.scientificName}</p>
      ) : null}
      {item.description ? (
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted">{item.description}</p>
      ) : null}
      {item.slug ? (
        <span className="mt-auto inline-flex items-center gap-2 pt-6 font-heading text-sm font-semibold text-primary">
          Read More
          <ArrowUpRight className="size-4" />
        </span>
      ) : null}
    </div>
  );

  return item.slug ? (
    <FadeIn className={wrapperClasses}>
      <Link
        href={`/ingredient/${item.slug}`}
        className="absolute inset-0 z-20 rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        aria-label={`View ${item.name}`}
      />
      <div className="relative z-10 flex h-full flex-col">{content}</div>
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
