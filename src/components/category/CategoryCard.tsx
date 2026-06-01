"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type CategoryCardProps = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

export function CategoryCard({ label, icon: Icon, href = "/categories" }: CategoryCardProps) {
  return (
    <motion.a
      href={href}
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -7 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group flex h-[110px] flex-col items-center justify-center gap-3 rounded-card border border-border-light bg-white p-3 text-center shadow-[0_14px_38px_rgba(15,23,42,0.05)] transition duration-300 hover:border-primary/38 hover:shadow-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
    >
      <motion.span
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.3 }}
        className="grid size-11 place-items-center rounded-full border border-primary/12 bg-soft-green text-primary transition duration-300 group-hover:border-gold/45 group-hover:bg-white group-hover:text-dark-green group-hover:shadow-[0_12px_30px_rgba(11,93,59,0.14)]"
      >
        <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
      </motion.span>
      <span className="max-w-[96px] font-heading text-xs font-semibold leading-4 text-text-dark sm:text-sm">
        {label}
      </span>
    </motion.a>
  );
}
