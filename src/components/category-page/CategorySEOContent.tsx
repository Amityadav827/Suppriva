"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";

export function CategorySEOContent({
  title,
  paragraphs,
  facts,
}: {
  title: string;
  paragraphs: string[];
  facts: string[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.42 }}
        className="rounded-[32px] border border-border-light bg-white p-6 shadow-premium md:p-8"
      >
        <h2 className="font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl">
          {title}
        </h2>
        <div className="mt-6 grid gap-5">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </motion.article>

      <motion.aside
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.42, delay: 0.08 }}
        className="rounded-[32px] border border-gold/24 bg-[linear-gradient(135deg,#FFFFFF,#F7F6F2)] p-6 shadow-premium md:p-8"
      >
        <h3 className="font-heading text-xl font-extrabold text-text-dark">
          Highlighted Facts
        </h3>
        <ul className="mt-5 grid gap-4">
          {facts.map((fact) => (
            <li key={fact} className="flex gap-3 text-sm leading-6 text-muted">
              <BadgeCheck className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </motion.aside>
    </div>
  );
}
