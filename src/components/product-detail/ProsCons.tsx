"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MinusCircle } from "lucide-react";

export function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ListCard title="Pros" items={pros} positive />
      <ListCard title="Cons" items={cons} />
    </div>
  );
}

function ListCard({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  const Icon = positive ? CheckCircle2 : MinusCircle;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35 }}
      className="rounded-[30px] border border-border-light bg-white p-6 shadow-premium"
    >
      <h3 className="font-heading text-2xl font-extrabold text-text-dark">
        {title}
      </h3>
      <ul className="mt-5 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted">
            <Icon
              className={`mt-0.5 size-5 shrink-0 ${positive ? "text-primary" : "text-gold"}`}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
