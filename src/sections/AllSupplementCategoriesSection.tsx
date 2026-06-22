"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CategoryPill } from "@/components/category/CategoryPill";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { homepageIngredients } from "@/lib/constants";

export function AllSupplementCategoriesSection() {
  return (
    <SectionWrapper id="all-categories">
      <SectionTitle
        title="Explore By Ingredients"
        subtitle="Discover vitamins, herbs, minerals, probiotics, adaptogens, and functional ingredients."
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
        {homepageIngredients.map((ingredient) => (
          <CategoryPill
            key={ingredient.label}
            label={ingredient.label}
            icon={ingredient.icon}
            href={ingredient.href}
          />
        ))}
      </motion.div>

      <div className="mt-10 flex justify-center">
        <PremiumButton href="/ingredients" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
          View All Ingredients
        </PremiumButton>
      </div>
    </SectionWrapper>
  );
}
