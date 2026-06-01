"use client";

import { motion } from "framer-motion";
import { CategoryPill } from "@/components/category/CategoryPill";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getCategoryIcon } from "@/lib/live-data";

type LiveCategoryPill = {
  label: string;
  slug: string;
};

export function AllSupplementCategoriesSection({
  categories,
}: {
  categories: LiveCategoryPill[];
}) {
  return (
    <SectionWrapper id="all-categories">
      <SectionTitle
        title="All Supplement Categories"
        subtitle="A structured directory for fast discovery and SEO-focused supplement browsing."
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
        {categories.map((category) => (
          <CategoryPill
            key={category.label}
            label={category.label}
            icon={getCategoryIcon(category.label)}
            href={`/category/${category.slug}`}
          />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
