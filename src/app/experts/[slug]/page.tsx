import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  ExternalLink,
  FlaskConical,
  HeartPulse,
  SearchCheck,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { IngredientCard } from "@/components/ingredients/IngredientCard";
import { Navbar } from "@/components/navbar/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { PageType } from "@/lib/database/constants";
import { getExpertPublicProfileData, getExpertsDirectoryItems } from "@/lib/experts/page-data";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildProfilePageJsonLd,
  buildPublicPersonJsonLd,
} from "@/lib/seo/structured-data";
import { getExpertiseIcon } from "@/components/experts/expert-icons";

type ExpertProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const experts = await getExpertsDirectoryItems();
  return experts.map(({ expert }) => ({ slug: expert.slug }));
}

export async function generateMetadata({
  params,
}: ExpertProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getExpertPublicProfileData(slug);

  if (!payload) {
    return {
      title: "Expert Not Found | Suppriva",
    };
  }

  return buildSeoMetadata(PageType.Static, `experts-${slug}`, {
    title:
      payload.expert.seo_title ||
      `${payload.expert.name} | ${payload.expert.designation || "Wellness Expert"} | Suppriva`,
    description:
      payload.expert.seo_description ||
      payload.expert.short_bio ||
      `Learn about ${payload.expert.name}, a wellness expert contributing educational guidance and ingredient resources at Suppriva.`,
    canonicalPath: `/experts/${payload.expert.slug}`,
    image: payload.expert.meta_image || payload.expert.profile_image,
    type: "article",
  });
}

function renderFullBio(fullBio: string) {
  const blocks = fullBio
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const listLines = lines.filter((line) => /^[-*]\s+/.test(line));

    if (listLines.length === lines.length) {
      return (
        <ul key={`${block}-${index}`} className="list-disc space-y-2 pl-5">
          {listLines.map((line) => (
            <li key={line}>{line.replace(/^[-*]\s+/, "")}</li>
          ))}
        </ul>
      );
    }

    return <p key={`${block}-${index}`}>{block}</p>;
  });
}

export default async function ExpertProfilePage({
  params,
}: ExpertProfilePageProps) {
  const { slug } = await params;
  const payload = await getExpertPublicProfileData(slug);

  if (!payload) {
    notFound();
  }

  const { expert, stats, relatedProducts, relatedIngredients, relatedBlogs } = payload;
  const personSchema = buildPublicPersonJsonLd({
    name: expert.name,
    path: `/experts/${expert.slug}`,
    image: expert.profile_image,
    jobTitle: expert.designation,
    description: expert.short_bio || expert.full_bio,
    sameAs: [expert.linkedin_url, expert.website_url].filter(
      (value): value is string => Boolean(value),
    ),
  });

  const reviewedCards = [
    {
      label: "Ingredient Guides",
      value: stats.ingredientGuides,
      icon: FlaskConical,
    },
    {
      label: "Product Reviews",
      value: stats.productReviews,
      icon: SearchCheck,
    },
    {
      label: "Wellness Articles",
      value: stats.blogArticles,
      icon: BookOpenText,
    },
    {
      label: "Health Goal Pages",
      value: stats.healthGoalPages,
      icon: HeartPulse,
    },
  ];

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug={`experts-${slug}`}
        schema={[
          personSchema,
          buildProfilePageJsonLd({
            title: expert.name,
            description:
              expert.short_bio ||
              `Wellness expert profile for ${expert.name} on Suppriva.`,
            path: `/experts/${expert.slug}`,
            mainEntity: personSchema,
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Experts", path: "/experts" },
            { name: expert.name, path: `/experts/${expert.slug}` },
          ]),
        ]}
      />
      <Navbar />
      <main className="bg-cream">
        <SectionWrapper tone="white">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center">
            <FadeIn className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="relative size-40 overflow-hidden rounded-full border-[6px] border-white bg-soft-green shadow-[0_28px_60px_rgba(15,23,42,0.16)] md:size-44 lg:size-[180px]">
                {expert.profile_image ? (
                  <Image
                    src={expert.profile_image}
                    alt={expert.name}
                    fill
                    sizes="(max-width: 768px) 160px, (max-width: 1024px) 176px, 180px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary">
                    <Stethoscope className="size-16" aria-hidden="true" />
                  </div>
                )}
              </div>
              <p className="mt-6 inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                <Stethoscope className="size-3.5 text-gold" aria-hidden="true" />
                Medical &amp; Editorial Advisory
              </p>
              <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-text-dark md:text-5xl">
                {expert.name}
              </h1>
              {expert.designation ? (
                <p className="mt-3 text-lg font-semibold text-primary">{expert.designation}</p>
              ) : null}
              {expert.experience_years ? (
                <p className="mt-2 text-sm leading-7 text-muted">
                  {expert.experience_years}+ years of experience
                </p>
              ) : null}
              {expert.short_bio ? (
                <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
                  {expert.short_bio}
                </p>
              ) : null}
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
                {expert.linkedin_url ? (
                  <PremiumButton
                    href={expert.linkedin_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    icon={<ExternalLink className="size-4" aria-hidden="true" />}
                  >
                    LinkedIn Profile
                  </PremiumButton>
                ) : null}
                <PremiumButton
                  href="/ask-expert"
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
            {expert.full_bio ? (
              <FadeIn className="rounded-[28px] border border-border-light bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-9">
                <h2 className="font-heading text-3xl font-extrabold text-text-dark">About</h2>
                <div className="mt-5 space-y-4 text-base leading-8 text-muted">
                  {renderFullBio(expert.full_bio)}
                </div>
              </FadeIn>
            ) : null}

            <FadeIn
              delay={0.04}
              className="rounded-[28px] border border-border-light bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-9"
            >
              <h2 className="font-heading text-3xl font-extrabold text-text-dark">
                Areas of Expertise
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {expert.expertise_tags.map((topic) => {
                  const Icon = getExpertiseIcon(topic);

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
              <div className="mt-5 space-y-4 text-base leading-8 text-muted">
                {renderFullBio(
                  expert.editorial_contribution ||
                    `${expert.name} contributes expert guidance to educational wellness content, ingredient explainers, and wellness resources published on Suppriva.\n\nThe role focuses on improving educational quality and helping readers better understand ingredients and wellness concepts.\n\nIndividual product rankings, affiliate partnerships, and editorial decisions remain independently managed by the Suppriva Editorial Team.`,
                )}
              </div>
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
                      {value} published resource{value === 1 ? "" : "s"}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>

            {relatedProducts.length || relatedIngredients.length || relatedBlogs.length ? (
              <FadeIn
                delay={0.14}
                className="rounded-[28px] border border-border-light bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-9"
              >
                <h2 className="font-heading text-3xl font-extrabold text-text-dark">
                  Related Content
                </h2>
                <p className="mt-3 text-base leading-8 text-muted">
                  Explore live Suppriva content currently associated with this expert profile.
                </p>

                <div className="mt-8 grid gap-8">
                  {relatedProducts.length ? (
                    <section>
                      <h3 className="font-heading text-2xl font-extrabold text-text-dark">
                        Product Reviews
                      </h3>
                      <div className="mt-5 grid gap-5 md:grid-cols-2">
                        {relatedProducts.map((product) => (
                          <ProductCard
                            key={product.href || product.slug || product.name}
                            product={product}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {relatedIngredients.length ? (
                    <section>
                      <h3 className="font-heading text-2xl font-extrabold text-text-dark">
                        Ingredient Guides
                      </h3>
                      <div className="mt-5 grid gap-5 md:grid-cols-2">
                        {relatedIngredients.map((ingredient) => (
                          <IngredientCard key={ingredient.id} ingredient={ingredient} />
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {relatedBlogs.length ? (
                    <section>
                      <h3 className="font-heading text-2xl font-extrabold text-text-dark">
                        Blog Articles
                      </h3>
                      <div className="mt-5 grid gap-5 md:grid-cols-2">
                        {relatedBlogs.map((blog) => (
                          <BlogCard key={blog.slug || blog.title} post={blog} />
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              </FadeIn>
            ) : null}

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
                    href="/ask-expert"
                    variant="secondary"
                    className="w-full border-white/30 bg-white text-primary hover:text-dark-green sm:w-auto"
                    icon={<ArrowRight className="size-4" aria-hidden="true" />}
                  >
                    Ask An Expert
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
