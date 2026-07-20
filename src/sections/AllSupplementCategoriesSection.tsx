"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CategoryPill } from "@/components/category/CategoryPill";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getCmsIcon } from "@/lib/cms-icons";
import {
  DEFAULT_HOMEPAGE_INGREDIENT_CHIPS,
  type HomepageIngredientChip,
} from "@/lib/homepage-ingredients-discovery";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

export function AllSupplementCategoriesSection({
  section,
  chips = DEFAULT_HOMEPAGE_INGREDIENT_CHIPS,
}: {
  section?: HomepageSectionConfig;
  chips?: HomepageIngredientChip[];
}) {
  const ctaLabel = section?.cta_label || "View All Ingredients";
  const ctaUrl = section?.cta_url || "/ingredients";
  const visibleChips = chips
    .filter((chip) => chip.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <SectionWrapper id="all-categories">
      <SectionTitle
        title={section?.title || "Explore By Ingredients"}
        subtitle={
          section?.subtitle ||
          "Discover vitamins, herbs, minerals, probiotics, adaptogens, and functional ingredients."
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
              staggerChildren: 0.035,
            },
          },
        }}
        className="mx-auto mt-12 grid max-w-[1180px] grid-cols-2 gap-3 sm:gap-4 md:mt-14 md:flex md:flex-wrap md:justify-center"
      >
        {visibleChips.map((ingredient) => (
          <CategoryPill
            key={ingredient.label}
            label={ingredient.label}
            icon={getCmsIcon(ingredient.icon)}
            href={ingredient.url}
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
