"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type CategoryPillProps = {
  label: string;
  icon: LucideIcon;
  href?: string;
  className?: string;
  labelClassName?: string;
};

export function CategoryPill({
  label,
  icon: Icon,
  href = "#best-sellers",
  className = "",
  labelClassName = "",
}: CategoryPillProps) {
  return (
    <motion.a
      href={href}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`group flex min-h-14 items-center justify-center gap-2 rounded-pill border border-primary/10 bg-soft-green px-4 py-3 text-center shadow-[0_12px_34px_rgba(6,57,33,0.06)] transition duration-300 hover:border-primary/38 hover:bg-[#dceee1] hover:shadow-[0_18px_46px_rgba(6,57,33,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:justify-start md:px-5 ${className}`}
    >
      <motion.span
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-primary shadow-[0_8px_20px_rgba(6,57,33,0.08)] transition duration-300 group-hover:text-dark-green"
      >
        <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
      </motion.span>
      <span
        className={`font-heading text-xs font-semibold leading-4 text-text-dark sm:text-sm ${labelClassName}`}
      >
        {label}
      </span>
    </motion.a>
  );
}
