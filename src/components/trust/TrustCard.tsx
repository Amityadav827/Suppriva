"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type TrustCardProps = {
  item: {
    title: string;
    description: string;
    icon: LucideIcon;
  };
};

export function TrustCard({ item }: TrustCardProps) {
  const Icon = item.icon;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative h-full overflow-hidden rounded-[28px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-primary/38 hover:shadow-premium-hover"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 size-32 rounded-full bg-soft-green opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
      />
      <motion.span
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 grid size-14 place-items-center rounded-full border border-primary/12 bg-soft-green text-primary shadow-[0_14px_34px_rgba(6,57,33,0.09)] transition duration-300 group-hover:bg-primary group-hover:text-white"
      >
        <Icon className="size-6" strokeWidth={1.9} aria-hidden="true" />
      </motion.span>

      <h3 className="relative z-10 mt-6 font-heading text-xl font-extrabold leading-tight text-text-dark">
        {item.title}
      </h3>
      <p className="relative z-10 mt-3 text-sm leading-6 text-muted">
        {item.description}
      </p>
    </motion.article>
  );
}
