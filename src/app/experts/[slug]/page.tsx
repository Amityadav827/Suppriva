import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  ExternalLink,
  FlaskConical,
  HeartPulse,
  Leaf,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { Navbar } from "@/components/navbar/Navbar";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { PageType } from "@/lib/database/constants";
import { onlyPublished } from "@/lib/live-data";
import { ADVISORY_EXPERT } from "@/lib/experts/advisory-board";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildPublicPersonJsonLd,
} from "@/lib/seo/structured-data";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { IngredientService } from "@/services/ingredient.service";
import { ProductService } from "@/services/product.service";

type ExpertProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const expertiseIconMap = {
  "Integrative Healthcare": HeartPulse,
  "Ayurveda & Herbal Wellness": Leaf,
  "Preventive Lifestyle": ShieldCheck,
  "Supplement Education": BookOpenText,
  "Public Health Awareness": Sparkles,
  "Wellness Research": BrainCircuit,
} as const;

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ slug: ADVISORY_EXPERT.slug }];
}

export async function generateMetadata({
  params,
}: ExpertProfilePageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug !== ADVISORY_EXPERT.slug) {
    return {
      title: "Expert Not Found | Suppriva",
    };
  }

  return buildSeoMetadata(PageType.Static, `experts-${slug}`, {
    title: "Dr. Arindham Chatterjee | Medical & Wellness Advisor | Suppriva",
    description:
      "Learn about Dr. Arindham Chatterjee, Medical & Wellness Advisor contributing educational wellness guidance and ingredient resources at Suppriva.",
    canonicalPath: ADVISORY_EXPERT.path,
    image: ADVISORY_EXPERT.image,
    type: "article",
  });
}

async function getReviewedContentCounts() {
  try {
    const [products, categories, blogs, ingredients] = await Promise.all([
      new ProductService().getAllProducts(),
      new CategoryService().getAllCategories(),
      new BlogService().getAllBlogs(),
      new IngredientService().getAllIngredients(),
    ]);

    return {
      ingredientGuides: onlyPublished(ingredients).length,
      productReviews: onlyPublished(products).length,
      wellnessArticles: onlyPublished(blogs).length,
      healthGoalPages: onlyPublished(categories).length,
    };
  } catch {
    return {
      ingredientGuides: null,
      productReviews: null,
      wellnessArticles: null,
      healthGoalPages: null,
    };
  }
}

export default async function ExpertProfilePage({
  params,
}: ExpertProfilePageProps) {
  const { slug } = await params;

  if (slug !== ADVISORY_EXPERT.slug) {
    notFound();
  }

  const counts = await getReviewedContentCounts();
  const reviewedCards = [
    {
      label: "Ingredient Guides",
      value: counts.ingredientGuides,
      icon: FlaskConical,
    },
    {
      label: "Product Reviews",
      value: counts.productReviews,
      icon: SearchCheck,
    },
    {
      label: "Wellness Articles",
      value: counts.wellnessArticles,
      icon: BookOpenText,
    },
    {
      label: "Health Goal Pages",
      value: counts.healthGoalPages,
      icon: HeartPulse,
    },
  ];

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug={`experts-${slug}`}
        schema={[
          buildPublicPersonJsonLd({
            name: ADVISORY_EXPERT.name,
            path: ADVISORY_EXPERT.path,
            image: ADVISORY_EXPERT.image,
            jobTitle: ADVISORY_EXPERT.designation,
            description: ADVISORY_EXPERT.aboutLong.join(" "),
            sameAs: [ADVISORY_EXPERT.linkedin],
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Experts", path: "/experts" },
            { name: ADVISORY_EXPERT.name, path: ADVISORY_EXPERT.path },
          ]),
        ]}
      />
      <Navbar />
      <main className="bg-cream">
        <SectionWrapper tone="white">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center">
            <FadeIn className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="relative size-40 overflow-hidden rounded-full border-[6px] border-white bg-soft-green shadow-[0_28px_60px_rgba(15,23,42,0.16)] md:size-44 lg:size-[180px]">
                <Image
                  src={ADVISORY_EXPERT.image}
                  alt={ADVISORY_EXPERT.name}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 176px, 180px"
                  className="object-cover"
                />
              </div>
              <p className="mt-6 inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                <Stethoscope className="size-3.5 text-gold" aria-hidden="true" />
                Medical &amp; Editorial Advisory
              </p>
              <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-text-dark md:text-5xl">
                {ADVISORY_EXPERT.name}
              </h1>
              <p className="mt-3 text-lg font-semibold text-primary">
                {ADVISORY_EXPERT.designation}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
                {ADVISORY_EXPERT.aboutShort}
              </p>
            </FadeIn>

            <FadeIn
              delay={0.08}
              className="rounded-[30px] border border-border-light bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(234,244,236,0.92)_48%,rgba(255,255,255,0.96))] p-7 shadow-[0_26px_70px_rgba(15,23,42,0.08)] md:p-9"
            >
              <p className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-white px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                <ShieldCheck className="size-3.5 text-gold" aria-hidden="true" />
                Wellness education
              </p>
              <h2 className="mt-5 font-heading text-3xl font-extrabold text-text-dark md:text-4xl">
                Expert guidance shaped for ingredient clarity and informed wellness reading.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted">
                Suppriva highlights wellness experts who strengthen educational
                quality, support better ingredient understanding, and help readers
                navigate everyday wellness topics with more confidence.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <PremiumButton
                  href={ADVISORY_EXPERT.linkedin}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  icon={<ExternalLink className="size-4" aria-hidden="true" />}
                >
                  LinkedIn Profile
                </PremiumButton>
                <PremiumButton
                  href="/contact"
                  className="w-full sm:w-auto"
                  icon={<ArrowRight className="size-4" aria-hidden="true" />}
                >
                  Ask an Expert
                </PremiumButton>
              </div>
            </FadeIn>
          </div>
        </SectionWrapper>

        <SectionWrapper tone="cream">
          <div className="grid gap-6">
            <FadeIn className="rounded-[28px] border border-border-light bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-9">
              <h2 className="font-heading text-3xl font-extrabold text-text-dark">About</h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-muted">
                {ADVISORY_EXPERT.aboutLong.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </FadeIn>

            <FadeIn
              delay={0.04}
              className="rounded-[28px] border border-border-light bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-9"
            >
              <h2 className="font-heading text-3xl font-extrabold text-text-dark">
                Areas of Expertise
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ADVISORY_EXPERT.expertise.map((topic) => {
                  const Icon = expertiseIconMap[topic];

                  return (
                    <div
                      key={topic}
                      className="rounded-[24px] border border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(234,244,236,0.88))] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-soft-green text-primary">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                        <p className="font-heading text-lg font-bold text-text-dark">
                          {topic}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FadeIn>

            <FadeIn
              delay={0.08}
              className="rounded-[28px] border border-border-light bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-9"
            >
              <h2 className="font-heading text-3xl font-extrabold text-text-dark">
                Editorial Contribution
              </h2>
              <p className="mt-5 text-base leading-8 text-muted">
                {ADVISORY_EXPERT.editorialContribution}
              </p>
            </FadeIn>

            <FadeIn
              delay={0.12}
              className="rounded-[28px] border border-border-light bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-9"
            >
              <h2 className="font-heading text-3xl font-extrabold text-text-dark">
                Content Reviewed
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {reviewedCards.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-[24px] border border-primary/10 bg-soft-green/45 p-5"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-white text-primary shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <p className="mt-5 font-heading text-xl font-bold text-text-dark">
                      {label}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      {typeof value === "number"
                        ? `${value}+ published resources`
                        : "Counts will appear here as connected content continues to expand."}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn
              delay={0.16}
              className="rounded-[30px] border border-primary/10 bg-[linear-gradient(135deg,rgba(11,93,59,0.97),rgba(15,114,73,0.92))] p-8 text-white shadow-[0_28px_70px_rgba(6,57,33,0.28)] md:p-10"
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                    <Stethoscope className="size-3.5 text-gold" aria-hidden="true" />
                    Ask an expert
                  </p>
                  <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight md:text-4xl">
                    Need help understanding an ingredient or wellness topic?
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-emerald-50/90">
                    Submit your question and receive educational guidance from our
                    wellness experts.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <PremiumButton
                    href="/contact"
                    variant="secondary"
                    className="w-full border-white/30 bg-white text-primary hover:text-dark-green sm:w-auto"
                    icon={<ArrowRight className="size-4" aria-hidden="true" />}
                  >
                    Ask an Expert
                  </PremiumButton>
                  <Link
                    href="/experts"
                    className="text-sm font-semibold text-emerald-50 transition hover:text-white"
                  >
                    Back to experts hub
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </SectionWrapper>
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
