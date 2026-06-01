"use client";

import { motion } from "framer-motion";
import { CategoryCard } from "@/components/category/CategoryCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getCategoryIcon } from "@/lib/live-data";

export function HealthNeedsSection({
  categories,
}: {
  categories: { label: string; slug: string }[];
}) {
  return (
    <SectionWrapper id="categories">
      <SectionTitle
        title="Explore By Health Needs"
        subtitle="Browse focused wellness categories curated for everyday health goals."
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
        className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-14 md:grid-cols-6 md:gap-5 xl:grid-cols-12"
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
    </SectionWrapper>
  );
}
