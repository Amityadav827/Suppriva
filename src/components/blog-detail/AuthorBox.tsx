"use client";

import { motion } from "framer-motion";
import { BadgeCheck, UserRound } from "lucide-react";
import type { BlogArticle } from "@/lib/blog-data";

export function AuthorBox({ author }: { author: BlogArticle["author"] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.42 }}
      className="rounded-[32px] border border-border-light bg-white p-6 shadow-premium md:p-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid size-20 shrink-0 place-items-center rounded-full border border-gold/24 bg-soft-green text-primary shadow-[0_16px_40px_rgba(6,57,33,0.10)]">
          <UserRound className="size-9" aria-hidden="true" />
        </div>
        <div>
          <p className="inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold text-primary">
            <BadgeCheck className="size-4 text-gold" aria-hidden="true" />
            Reviewed editorial profile
          </p>
          <h2 className="mt-3 font-heading text-2xl font-extrabold text-text-dark">
            {author.name}
          </h2>
          <p className="mt-1 font-heading text-sm font-semibold text-primary">
            {author.expertise}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">{author.bio}</p>
        </div>
      </div>
    </motion.section>
  );
}
