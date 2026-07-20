"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { getCmsIcon } from "@/lib/cms-icons";
import {
  DEFAULT_HOMEPAGE_TRUST_BADGES,
  type HomepageTrustBadgesCms,
} from "@/lib/homepage-trust-badges";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

export function TrustBadgesStrip({
  section,
  cms = DEFAULT_HOMEPAGE_TRUST_BADGES,
}: {
  section?: HomepageSectionConfig;
  cms?: HomepageTrustBadgesCms;
}) {
  const ctaLabel = section?.cta_label;
  const ctaUrl = section?.cta_url;
  const badges = cms.badges
    .filter((badge) => badge.is_visible)
    .map((badge) => ({
      title: badge.title,
      subtitle: badge.description,
      icon: getCmsIcon(badge.icon),
    }));

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(90deg,#063921,#0B5D3B)] py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_30%,rgba(217,165,32,0.18)_0%,rgba(217,165,32,0)_30%),radial-gradient(circle_at_82%_70%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_26%)]"
      />
      <div className="site-container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-2xl font-extrabold leading-tight text-white md:text-3xl xl:text-4xl">
            {section?.title ||
              "Why Thousands Start Their Wellness Journey with Suppriva"}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-emerald-50/90 md:text-base">
            {section?.subtitle ||
              "Discover supplements, ingredients, wellness solutions, and expert insights designed to help you make informed health decisions."}
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.07,
              },
            },
          }}
          className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {badges.map((badge, index) => (
            <TrustBadge key={`${badge.title}-${index}`} badge={badge} />
          ))}
        </motion.div>
        {ctaLabel && ctaUrl ? (
          <div className="mt-8 flex justify-center">
            <PremiumButton
              href={ctaUrl}
              variant="secondary"
              icon={<ArrowRight className="size-4" aria-hidden="true" />}
            >
              {ctaLabel}
            </PremiumButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
