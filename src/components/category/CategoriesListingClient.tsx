"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CategoryCard } from "@/components/category/CategoryCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { getCategoryIcon } from "@/lib/live-data";

type CategoryListingItem = {
  title: string;
  slug: string;
};

export function CategoriesListingClient({
  categories,
}: {
  categories: CategoryListingItem[];
}) {
  return (
    <>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.045 } },
        }}
        className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-14 md:grid-cols-6 md:gap-5 xl:grid-cols-11"
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            label={category.title}
            icon={getCategoryIcon(category.title)}
            href={`/category/${category.slug}`}
          />
        ))}
      </motion.div>

      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        <p className="max-w-2xl text-base leading-7 text-muted">
          Explore ingredients and wellness solutions related to your health
          goals.
        </p>
        <PremiumButton
          href="/ingredients"
          icon={<ArrowRight className="size-4" aria-hidden="true" />}
        >
          Explore Ingredients
        </PremiumButton>
      </div>
    </>
  );
}
