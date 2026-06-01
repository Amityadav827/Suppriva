"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="rounded-[28px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <h3 className="mt-3 font-heading text-3xl font-extrabold text-text-dark">
            {value}
          </h3>
        </div>
        <span className="grid size-11 place-items-center rounded-full bg-soft-green text-primary">
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 font-heading text-sm font-semibold text-primary">
        {change} this month
      </p>
    </motion.article>
  );
}
