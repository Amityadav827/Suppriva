"use client";

import { motion } from "framer-motion";
import { Award, BarChart3, BadgeCheck, TrendingUp } from "lucide-react";
import { GridWrapper } from "@/components/layout/GridWrapper";

const icons = [BarChart3, Award, TrendingUp, BadgeCheck];

export function CategoryStats({ stats }: { stats: string[] }) {
  return (
    <GridWrapper className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[index % icons.length];

        return (
          <motion.div
            key={stat}
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.32 }}
            className="rounded-card border border-border-light bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] transition duration-300 hover:border-gold/60 hover:shadow-premium"
          >
            <span className="grid size-11 place-items-center rounded-full bg-soft-green text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-heading text-xl font-extrabold text-text-dark">
              {stat}
            </p>
          </motion.div>
        );
      })}
    </GridWrapper>
  );
}
