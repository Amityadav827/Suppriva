"use client";

import { ArrowRight } from "lucide-react";
import { GridWrapper } from "@/components/layout/GridWrapper";
import { TrustCard } from "@/components/trust/TrustCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getCmsIcon } from "@/lib/cms-icons";
import {
  DEFAULT_HOMEPAGE_WHY_CHOOSE,
  type HomepageWhyChooseCms,
} from "@/lib/homepage-why-choose";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

export function WhyChooseSupprivaSection({
  section,
  cms = DEFAULT_HOMEPAGE_WHY_CHOOSE,
}: {
  section?: HomepageSectionConfig;
  cms?: HomepageWhyChooseCms;
}) {
  const ctaLabel = section?.cta_label;
  const ctaUrl = section?.cta_url;
  const cards = cms.cards
    .filter((card) => card.is_visible)
    .map((card) => ({
      title: card.title,
      description: card.description,
      icon: getCmsIcon(card.icon),
    }));

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
        {cards.map((item, index) => (
          <TrustCard key={`${item.title}-${index}`} item={item} />
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
