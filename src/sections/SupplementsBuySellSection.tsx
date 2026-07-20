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
import { getCmsIcon } from "@/lib/cms-icons";
import {
  DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS,
  getDefaultShowcaseProductMeta,
  type HomepageWellnessSolutionsCms,
} from "@/lib/homepage-wellness-solutions";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

export function SupplementsBuySellSection({
  section,
  cms = DEFAULT_HOMEPAGE_WELLNESS_SOLUTIONS,
}: {
  section?: HomepageSectionConfig;
  cms?: HomepageWellnessSolutionsCms;
}) {
  const settings = cms.settings;
  const sectionCtaLabel = section?.cta_label || "View All";
  const sectionCtaUrl = section?.cta_url || "/supplements";
  const featureCards = cms.feature_cards.filter((feature) => feature.is_visible);
  const showcaseProducts = cms.showcase_products
    .filter((product) => product.is_visible)
    .map((product, index) => {
      const meta = getDefaultShowcaseProductMeta(product.product_name, product.url);

      return {
        name: product.product_name,
        benefit:
          meta?.benefit ||
          "Ingredient-focused wellness support for informed supplement discovery.",
        category: meta?.category || "Wellness",
        status: product.label,
        href: product.url,
        image: meta?.image || "/assets/hero-supplements.webp",
        accent:
          meta?.accent ||
          (index % 2 === 0
            ? "from-soft-green to-primary/[0.10]"
            : "from-soft-green to-gold/[0.14]"),
        imageScale: meta?.imageScale || "scale-[1.03]",
      };
    });

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
              {settings.left_badge}
            </span>

            <h2 className="mt-6 font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl lg:text-4xl">
              {settings.left_heading}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted">
              {settings.left_description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {featureCards.map((feature) => {
                const Icon = getCmsIcon(feature.icon);

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

            {settings.left_cta_label && settings.left_cta_url ? (
              <PremiumButton
                href={settings.left_cta_url}
                className="mt-8 w-full sm:w-auto"
                icon={<ArrowRight className="size-4" aria-hidden="true" />}
              >
                {settings.left_cta_label}
              </PremiumButton>
            ) : null}
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
              {settings.bottom_description}
            </p>
          </div>
        </motion.div>

        <div>
          <div className="mb-4 flex items-center justify-end">
            <Link
              href={sectionCtaUrl}
              className="font-heading text-sm font-semibold text-primary transition hover:text-dark-green"
            >
              {sectionCtaLabel} -&gt;
            </Link>
          </div>
          <GridWrapper className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {showcaseProducts.map((product) => (
              <SupplementShowcaseCard key={product.name} product={product} />
            ))}
          </GridWrapper>
        </div>
      </div>
    </SectionWrapper>
  );
}
