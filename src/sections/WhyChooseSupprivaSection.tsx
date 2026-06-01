"use client";

import { GridWrapper } from "@/components/layout/GridWrapper";
import { TrustCard } from "@/components/trust/TrustCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { whyChooseItems } from "@/lib/constants";

export function WhyChooseSupprivaSection() {
  return (
    <SectionWrapper id="why-choose-suppriva" tone="white">
      <SectionTitle
        title="Why Choose Suppriva"
        subtitle="Trusted wellness solutions designed to support your healthier lifestyle."
      />

      <GridWrapper className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {whyChooseItems.map((item) => (
          <TrustCard key={item.title} item={item} />
        ))}
      </GridWrapper>
    </SectionWrapper>
  );
}
