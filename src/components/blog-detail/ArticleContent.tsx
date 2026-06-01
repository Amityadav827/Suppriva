"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Quote } from "lucide-react";
import { CalloutBlock } from "@/components/blog-detail/CalloutBlock";
import type { BlogArticle } from "@/lib/blog-data";

export function ArticleContent({ article }: { article: BlogArticle }) {
  return (
    <article className="min-w-0">
      <div className="grid gap-10">
        {article.sections.map((section, index) => (
          <motion.section
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="scroll-mt-32 rounded-[32px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] md:p-8"
          >
            <h2 className="font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl">
              {section.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-muted">{section.intro}</p>
            {section.h3 ? (
              <h3 className="mt-6 font-heading text-xl font-extrabold text-text-dark">
                {section.h3}
              </h3>
            ) : null}
            {section.bullets ? (
              <ul className="mt-4 grid gap-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm leading-6 text-muted">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.quote ? (
              <blockquote className="mt-6 rounded-[24px] border border-gold/24 bg-gold/10 p-5 text-base leading-8 text-text-dark">
                <Quote className="mb-3 size-5 text-gold" aria-hidden="true" />
                {section.quote}
              </blockquote>
            ) : null}
            {index === 1 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {article.callouts.map((callout) => (
                  <CalloutBlock key={callout.title} {...callout} />
                ))}
              </div>
            ) : null}
          </motion.section>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.42 }}
        className="mt-10 overflow-hidden rounded-[32px] border border-border-light bg-white shadow-premium"
      >
        <div className="border-b border-border-light p-6 md:p-8">
          <h2 className="font-heading text-2xl font-extrabold text-text-dark">
            {article.table.title}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-soft-green font-heading text-text-dark">
              <tr>
                <th className="px-6 py-4">Ingredient</th>
                <th className="px-6 py-4">Primary Use</th>
                <th className="px-6 py-4">Note</th>
              </tr>
            </thead>
            <tbody>
              {article.table.rows.map((row) => (
                <tr key={row.join("-")} className="border-t border-border-light">
                  {row.map((cell) => (
                    <td key={cell} className="px-6 py-4 text-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </article>
  );
}
