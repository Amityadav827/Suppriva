"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type TrustBadgeProps = {
  badge: {
    title: string;
    subtitle: string;
    icon: LucideIcon;
  };
};

export function TrustBadge({ badge }: TrustBadgeProps) {
  const Icon = badge.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="group flex items-center gap-4 rounded-card border border-white/10 bg-white/[0.06] p-5 shadow-[0_22px_54px_rgba(0,0,0,0.13)] backdrop-blur transition duration-300 hover:border-gold/45 hover:bg-white/[0.09]"
    >
      <motion.span
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.28 }}
        className="grid size-12 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/12 text-gold shadow-[0_12px_30px_rgba(217,165,32,0.13)]"
      >
        <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
      </motion.span>
      <div>
        <h3 className="font-heading text-base font-extrabold text-white">
          {badge.title}
        </h3>
        <p className="mt-1 text-sm leading-5 text-white/68">{badge.subtitle}</p>
      </div>
    </motion.div>
  );
}
