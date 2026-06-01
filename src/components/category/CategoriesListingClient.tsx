"use client";

import { motion } from "framer-motion";
import { CategoryPill } from "@/components/category/CategoryPill";
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
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
      className="mx-auto mt-12 grid max-w-[1180px] grid-cols-2 gap-3 sm:gap-4 md:mt-14 md:flex md:flex-wrap md:justify-center"
    >
      {categories.map((category) => (
        <CategoryPill
          key={category.slug}
          label={category.title}
          icon={getCategoryIcon(category.title)}
          href={`/category/${category.slug}`}
        />
      ))}
    </motion.div>
  );
}
