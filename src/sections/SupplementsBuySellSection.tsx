"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { GridWrapper } from "@/components/layout/GridWrapper";
import {
  SupplementShowcaseCard,
  type ShowcaseProductData,
} from "@/components/product/SupplementShowcaseCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { buySellBullets } from "@/lib/constants";

export function SupplementsBuySellSection({
  products,
}: {
  products: ShowcaseProductData[];
}) {
  return (
    <SectionWrapper id="supplements-buy-sell">
      <SectionTitle
        title="Supplements Buy / Sell"
        subtitle="Discover premium supplements carefully selected for wellness, performance & daily health."
      />

      <div className="mt-12 grid items-center gap-10 md:mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 xl:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[32px] border border-border-light bg-white p-7 shadow-premium sm:p-9 lg:p-10"
        >
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 size-52 rounded-full bg-gold/12 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-20 size-60 rounded-full bg-soft-green blur-3xl"
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-soft-green px-4 py-2 font-heading text-sm font-semibold text-primary">
              <CheckCircle2 className="size-4 text-gold" aria-hidden="true" />
              Curated Supplement Marketplace
            </span>

            <h2 className="mt-6 font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl lg:text-4xl">
              Buy smarter with trusted wellness picks.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted">
              Explore a clean selection of high-intent supplement categories,
              comparison-ready products, and wellness-focused recommendations
              built for confident decisions.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {buySellBullets.map((bullet) => (
                <div
                  key={bullet}
                  className="flex items-center gap-3 rounded-2xl border border-border-light bg-white/76 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-soft-green text-primary">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-sm font-semibold leading-5 text-text-dark">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>

            <PremiumButton
              href="/products"
              className="mt-8 w-full sm:w-auto"
              icon={<ArrowRight className="size-4" aria-hidden="true" />}
            >
              Browse All Supplements
            </PremiumButton>
          </div>
        </motion.div>

        <GridWrapper className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <SupplementShowcaseCard key={product.name} product={product} />
          ))}
        </GridWrapper>
      </div>
    </SectionWrapper>
  );
}
