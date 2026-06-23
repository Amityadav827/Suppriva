import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, ShieldCheck, Stethoscope } from "lucide-react";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { FeaturedExpertCard } from "@/components/experts/FeaturedExpertCard";
import { Navbar } from "@/components/navbar/Navbar";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { PageType } from "@/lib/database/constants";
import { ADVISORY_EXPERT } from "@/lib/experts/advisory-board";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Static, "experts", {
    title: "Medical & Editorial Advisory Board | Suppriva",
    description:
      "Meet the wellness professionals contributing expert guidance to Suppriva's educational wellness resources.",
    canonicalPath: "/experts",
  });
}

const trustPoints = [
  "Improves educational quality across wellness resources",
  "Strengthens ingredient understanding for everyday readers",
  "Supports a more informed and confidence-building discovery experience",
];

export default function ExpertsPage() {
  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug="experts"
        schema={[
          buildCollectionPageJsonLd({
            title: "Meet Our Wellness Experts",
            description:
              "Meet the wellness professionals who contribute expert guidance and editorial review for Suppriva's educational wellness resources.",
            path: "/experts",
            items: [{ name: ADVISORY_EXPERT.name, path: ADVISORY_EXPERT.path }],
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Experts", path: "/experts" },
          ]),
        ]}
      />
      <Navbar />
      <main className="bg-cream">
        <SectionWrapper tone="white">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-pill border border-primary/12 bg-white px-4 py-2 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <ShieldCheck className="size-4 text-gold" aria-hidden="true" />
              Medical &amp; Editorial Advisory Board
            </p>
            <h1 className="mt-5 font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl lg:text-5xl">
              Meet Our Wellness Experts
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-muted">
              Meet the wellness professionals who contribute expert guidance and
              editorial review for Suppriva&apos;s educational wellness resources.
            </p>
          </FadeIn>

          <FeaturedExpertCard
            className="mx-auto mt-12 max-w-6xl"
            ctaLabel="View Profile"
            ctaHref={ADVISORY_EXPERT.path}
          />
        </SectionWrapper>

        <SectionWrapper tone="cream">
          <FadeIn className="mx-auto max-w-6xl rounded-[30px] border border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(234,244,236,0.92)_48%,rgba(255,255,255,0.94))] p-7 shadow-[0_26px_70px_rgba(15,23,42,0.08)] md:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  <Stethoscope className="size-3.5 text-gold" aria-hidden="true" />
                  Why Expert Review Matters
                </p>
                <h2 className="mt-5 font-heading text-3xl font-extrabold text-text-dark md:text-4xl">
                  Better wellness education starts with thoughtful expert guidance.
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
                  Suppriva works with wellness professionals and subject-matter
                  contributors to improve educational quality, ingredient
                  understanding, and wellness awareness.
                </p>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
                  This helps readers make more informed wellness decisions while
                  keeping educational clarity, trust, and practical ingredient
                  literacy at the center of the experience.
                </p>
              </div>

              <div className="grid gap-4">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[22px] border border-white/80 bg-white/82 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-soft-green text-primary">
                        <BadgeCheck className="size-5" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-semibold leading-7 text-text-dark">
                        {point}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-center lg:justify-start">
              <PremiumButton href={ADVISORY_EXPERT.path} variant="secondary" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
                Explore Featured Profile
              </PremiumButton>
            </div>
          </FadeIn>
        </SectionWrapper>
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
