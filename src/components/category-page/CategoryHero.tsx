"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { CategoryDetail } from "@/lib/category-data";

export function CategoryHero({ category }: { category: CategoryDetail }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 xl:gap-20">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center lg:text-left"
      >
        <span className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-white px-4 py-2 font-heading text-sm font-semibold text-primary shadow-[0_14px_36px_rgba(6,57,33,0.08)]">
          <Sparkles className="size-4 text-gold" aria-hidden="true" />
          {category.eyebrow}
        </span>
        <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.1] text-text-dark md:text-5xl lg:text-6xl">
          {category.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted lg:mx-0">
          {category.subtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.48, ease: "easeOut", delay: 0.08 }}
        className="relative mx-auto flex min-h-[380px] w-full max-w-[620px] items-center justify-center"
      >
        <motion.div
          aria-hidden="true"
          animate={{ scale: [1, 1.04, 1], opacity: [0.55, 0.82, 0.55] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute size-[310px] rounded-full bg-gold/20 blur-3xl sm:size-[420px]"
        />
        <div
          aria-hidden="true"
          className="absolute size-[280px] rounded-full border-[18px] border-gold/45 bg-white/30 shadow-[0_0_90px_rgba(217,165,32,0.22)] sm:size-[390px]"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-[360px] w-[330px] sm:h-[460px] sm:w-[430px]"
        >
          <Image
            src={category.image || "/assets/hero-supplements.webp"}
            alt={`${category.title} supplement bottles`}
            fill
            priority
            sizes="(max-width: 768px) 330px, 430px"
            className="object-contain drop-shadow-[0_34px_42px_rgba(6,57,33,0.24)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
