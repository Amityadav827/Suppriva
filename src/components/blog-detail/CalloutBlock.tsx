"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Lightbulb, Sparkles } from "lucide-react";

const icons = {
  "Expert Tip": Lightbulb,
  "Research Insight": Sparkles,
  "Key Takeaway": BadgeCheck,
};

export function CalloutBlock({
  type,
  title,
  text,
}: {
  type: string;
  title: string;
  text: string;
}) {
  const Icon = icons[type as keyof typeof icons] ?? Sparkles;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.32 }}
      className="rounded-[28px] border border-gold/24 bg-[linear-gradient(135deg,#FFFFFF,#F7F6F2)] p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
    >
      <span className="inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold text-primary">
        <Icon className="size-4 text-gold" aria-hidden="true" />
        {type}
      </span>
      <h3 className="mt-4 font-heading text-xl font-extrabold text-text-dark">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </motion.article>
  );
}
