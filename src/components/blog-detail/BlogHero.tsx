"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Clock3, UserRound } from "lucide-react";
import type { BlogArticle } from "@/lib/blog-data";

export function BlogHero({ article }: { article: BlogArticle }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 xl:gap-20">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center lg:text-left"
      >
        <Link
          href={`/category/${article.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
          className="inline-flex rounded-pill border border-primary/10 bg-white px-4 py-2 font-heading text-sm font-semibold text-primary shadow-[0_14px_36px_rgba(6,57,33,0.08)] transition hover:border-gold/70 hover:text-dark-green"
        >
          {article.category}
        </Link>
        <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.1] text-text-dark md:text-5xl lg:text-6xl">
          {article.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted lg:mx-0">
          {article.summary}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-muted lg:justify-start">
          <Meta icon={<Clock3 className="size-4" />} label={article.readingTime} />
          <Meta icon={<CalendarDays className="size-4" />} label={article.publishDate} />
          <Meta icon={<UserRound className="size-4" />} label={article.author.name} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.48, ease: "easeOut", delay: 0.08 }}
        className="group relative overflow-hidden rounded-[34px] border border-border-light bg-white p-3 shadow-premium"
      >
        <div className="relative h-[330px] overflow-hidden rounded-[28px] bg-soft-green md:h-[460px]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(217,165,32,0.24),transparent_36%),linear-gradient(180deg,rgba(6,57,33,0)_45%,rgba(6,57,33,0.25)_100%)]" />
        </div>
      </motion.div>
    </div>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-pill border border-border-light bg-white px-3 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <span className="text-gold">{icon}</span>
      {label}
    </span>
  );
}
