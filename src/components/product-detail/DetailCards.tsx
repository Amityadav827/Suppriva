"use client";

import { motion } from "framer-motion";
import {
  BatteryCharging,
  Brain,
  CheckCircle2,
  Coffee,
  Flame,
  Leaf,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const benefitIcons = [Flame, Zap, Scale, CheckCircle2];
const ingredientIcons = [Leaf, BatteryCharging, ShieldCheck, Coffee, Brain, Sparkles];

export function BenefitCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  const Icon = benefitIcons[index % benefitIcons.length];

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -7 }}
      transition={{ duration: 0.35 }}
      className="group h-full rounded-[28px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-primary/38 hover:shadow-premium-hover"
    >
      <span className="grid size-14 place-items-center rounded-full bg-soft-green text-primary transition duration-300 group-hover:bg-primary group-hover:text-white">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-heading text-xl font-extrabold text-text-dark">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </motion.article>
  );
}

export function IngredientCard({
  name,
  benefit,
  index,
}: {
  name: string;
  benefit: string;
  index: number;
}) {
  const Icon = ingredientIcons[index % ingredientIcons.length];

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -7 }}
      transition={{ duration: 0.35 }}
      className="group rounded-[28px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium-hover"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full border border-gold/20 bg-gold/10 text-primary transition duration-300 group-hover:scale-105">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-heading text-lg font-extrabold text-text-dark">
            {name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">{benefit}</p>
        </div>
      </div>
    </motion.article>
  );
}
