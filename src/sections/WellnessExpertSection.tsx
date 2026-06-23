"use client";

import { ShieldCheck } from "lucide-react";
import { FeaturedExpertCard } from "@/components/experts/FeaturedExpertCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function WellnessExpertSection() {
  return (
    <SectionWrapper id="wellness-expert" tone="white">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-pill border border-primary/12 bg-white px-4 py-2 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <ShieldCheck className="size-4 text-gold" aria-hidden="true" />
          Medical &amp; Editorial Advisory
        </p>
        <h2 className="mt-5 font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl lg:text-5xl">
          Meet Our Wellness Expert
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-muted">
          Our educational wellness content and ingredient resources are supported by
          expert guidance to help readers make more informed wellness decisions.
        </p>
      </FadeIn>

      <FeaturedExpertCard
        className="mx-auto mt-12 max-w-6xl"
        ctaLabel="Explore Our Experts"
        ctaHref="/experts"
      />
    </SectionWrapper>
  );
}
