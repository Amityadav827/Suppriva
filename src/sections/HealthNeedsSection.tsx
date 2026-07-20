"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/category/CategoryCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";
import { getCategoryIcon } from "@/lib/live-data";

export function HealthNeedsSection({
  categories,
  section,
}: {
  categories: { label: string; slug: string }[];
  section?: HomepageSectionConfig;
}) {
  const ctaLabel = section?.cta_label;
  const ctaUrl = section?.cta_url;

  return (
    <SectionWrapper id="categories">
      <SectionTitle
        title={section?.title || "Explore By Health Needs"}
        subtitle={
          section?.subtitle ||
          "Browse focused wellness categories curated for everyday health goals."
        }
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.045,
            },
          },
        }}
        className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-14 md:grid-cols-6 md:gap-5 xl:grid-cols-11"
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.label}
            label={category.label}
            icon={getCategoryIcon(category.label)}
            href={`/category/${category.slug}`}
          />
        ))}
      </motion.div>

      {ctaLabel && ctaUrl ? (
        <div className="mt-10 flex justify-center">
          <PremiumButton
            href={ctaUrl}
            icon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            {ctaLabel}
          </PremiumButton>
        </div>
      ) : null}
    </SectionWrapper>
  );
}
