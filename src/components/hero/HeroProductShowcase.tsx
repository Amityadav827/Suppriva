"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { heroGoalPills } from "@/lib/constants";

const heroGoalPillPositions: Array<{
  label: string;
  icon: LucideIcon;
  className: string;
}> = [
  {
    label: heroGoalPills[0].label,
    icon: heroGoalPills[0].icon,
    className:
      "left-2 top-12 hidden sm:flex lg:left-0 lg:top-16",
  },
  {
    label: heroGoalPills[1].label,
    icon: heroGoalPills[1].icon,
    className:
      "right-0 top-8 hidden sm:flex lg:right-2",
  },
  {
    label: heroGoalPills[2].label,
    icon: heroGoalPills[2].icon,
    className:
      "right-2 top-44 hidden md:flex lg:right-0 lg:top-48",
  },
  {
    label: heroGoalPills[3].label,
    icon: heroGoalPills[3].icon,
    className:
      "bottom-28 right-8 hidden md:flex lg:bottom-32 lg:right-4",
  },
  {
    label: heroGoalPills[4].label,
    icon: heroGoalPills[4].icon,
    className:
      "left-2 top-1/2 hidden sm:flex -translate-y-1/2 lg:left-0",
  },
];

export function HeroProductShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      className="relative mx-auto flex min-h-[430px] w-full max-w-[620px] items-center justify-center sm:min-h-[560px] lg:max-w-[680px]"
      aria-label="Premium supplement product showcase"
    >
      <div className="absolute inset-x-8 top-10 h-[72%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.92)_0%,rgba(234,244,236,0.72)_42%,rgba(247,246,242,0)_72%)] blur-2xl" />

      <motion.div
        aria-hidden="true"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        className="absolute size-[300px] rounded-full border-[18px] border-gold/70 shadow-[0_0_90px_rgba(217,165,32,0.24)] sm:size-[420px] sm:border-[24px] lg:size-[470px]"
      />

      <div
        aria-hidden="true"
        className="absolute size-[250px] rounded-full border border-primary/10 bg-white/36 shadow-[inset_0_0_70px_rgba(255,255,255,0.85)] sm:size-[390px] lg:size-[430px]"
      />

      <Leaf className="left-4 top-24 rotate-[-32deg] bg-primary/18" />
      <Leaf className="right-7 top-28 rotate-[34deg] bg-gold/22" />
      <Leaf className="bottom-24 left-16 rotate-[24deg] bg-primary/16" />
      <Leaf className="bottom-16 right-14 rotate-[-38deg] bg-primary/14" />

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 h-[390px] w-[340px] sm:h-[530px] sm:w-[470px] lg:h-[590px] lg:w-[520px]"
      >
        <Image
          src="/assets/hero-supplements.webp"
          alt="Premium supplement bottles with green and gold packaging"
          fill
          priority
          sizes="(max-width: 640px) 340px, (max-width: 1024px) 470px, 520px"
          className="object-contain drop-shadow-[0_38px_42px_rgba(6,57,33,0.22)]"
        />
      </motion.div>

      <div className="absolute bottom-2 left-0 z-20 hidden w-full max-w-[250px] rounded-card border border-white/70 bg-white/86 p-4 shadow-premium backdrop-blur md:block lg:left-4">
        <p className="font-heading text-sm font-semibold text-text-dark">
          Curated Wellness Collection
        </p>
        <p className="mt-1 text-sm leading-6 text-muted">
          Discover supplements organized by ingredients, health goals, and
          everyday wellness needs.
        </p>
      </div>

      {heroGoalPillPositions.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.label}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4.4 + index * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.18,
            }}
            className={`absolute z-20 items-center gap-2 rounded-pill border border-primary/10 bg-soft-green/88 px-4 py-3 shadow-[0_18px_44px_rgba(6,57,33,0.11)] backdrop-blur ${item.className}`}
          >
            <span className="grid size-8 place-items-center rounded-full bg-white/88 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-xs font-semibold text-text-dark">
              {item.label}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function Leaf({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-0 h-16 w-8 rounded-[100%_0_100%_0] shadow-[0_16px_36px_rgba(6,57,33,0.08)] sm:h-24 sm:w-11 ${className}`}
    />
  );
}
