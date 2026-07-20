"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { GridWrapper } from "@/components/layout/GridWrapper";
import {
  SupplementShowcaseCard,
} from "@/components/product/SupplementShowcaseCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { buySellFeatures, buySellShowcaseProducts } from "@/lib/constants";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

export function SupplementsBuySellSection({
  section,
}: {
  section?: HomepageSectionConfig;
}) {
  const ctaLabel = section?.cta_label || "Explore Wellness Categories";
  const ctaUrl = section?.cta_url || "/category";

  return (
    <SectionWrapper id="supplements-buy-sell">
      <SectionTitle
        title={section?.title || "Discover Wellness Solutions"}
        subtitle={
          section?.subtitle ||
          "Explore trusted supplements, ingredient-focused products, and wellness collections designed for informed choices."
        }
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
              Curated Wellness Collection
            </span>

            <h2 className="mt-6 font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl lg:text-4xl">
              Discover Supplements That Match Your Wellness Goals
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted">
              Explore curated wellness solutions, ingredient-focused products,
              and popular health categories-all designed to help users make
              informed choices.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {buySellFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                <div
                  key={feature.title}
                  className="flex items-center gap-3 rounded-2xl border border-border-light bg-white/76 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-soft-green text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-heading text-sm font-semibold leading-5 text-text-dark">
                      {feature.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      {feature.description}
                    </span>
                  </span>
                </div>
                );
              })}
            </div>

            {ctaLabel && ctaUrl ? (
              <PremiumButton
                href={ctaUrl}
                className="mt-8 w-full sm:w-auto"
                icon={<ArrowRight className="size-4" aria-hidden="true" />}
              >
                {ctaLabel}
              </PremiumButton>
            ) : null}
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
              Explore wellness products organized by health goals, ingredients,
              and lifestyle needs.
            </p>
          </div>
        </motion.div>

        <div>
          <div className="mb-4 flex items-center justify-end">
            <Link
              href="/supplements"
              className="font-heading text-sm font-semibold text-primary transition hover:text-dark-green"
            >
              View All -&gt;
            </Link>
          </div>
          <GridWrapper className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {buySellShowcaseProducts.map((product) => (
              <SupplementShowcaseCard key={product.name} product={product} />
            ))}
          </GridWrapper>
        </div>
      </div>
    </SectionWrapper>
  );
}
