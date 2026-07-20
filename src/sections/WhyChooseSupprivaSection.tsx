"use client";

import { ArrowRight } from "lucide-react";
import { GridWrapper } from "@/components/layout/GridWrapper";
import { TrustCard } from "@/components/trust/TrustCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { whyChooseItems } from "@/lib/constants";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

export function WhyChooseSupprivaSection({
  section,
}: {
  section?: HomepageSectionConfig;
}) {
  const ctaLabel = section?.cta_label;
  const ctaUrl = section?.cta_url;

  return (
    <SectionWrapper id="why-choose-suppriva" tone="white">
      <SectionTitle
        title={section?.title || "Your Wellness Journey Starts Here"}
        subtitle={
          section?.subtitle ||
          "Explore trusted supplements, ingredient insights, wellness solutions, and expert guidance-all in one place."
        }
      />

      <GridWrapper className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {whyChooseItems.map((item) => (
          <TrustCard key={item.title} item={item} />
        ))}
      </GridWrapper>
      {ctaLabel && ctaUrl ? (
        <div className="mt-10 flex justify-center">
          <PremiumButton
            href={ctaUrl}
            variant="secondary"
            icon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            {ctaLabel}
          </PremiumButton>
        </div>
      ) : null}
    </SectionWrapper>
  );
}
