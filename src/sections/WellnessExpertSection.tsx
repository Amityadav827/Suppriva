"use client";

import Image from "next/image";
import type { Expert } from "@/lib/database/types";
import { motion } from "framer-motion";
import { ArrowRight, Stethoscope } from "lucide-react";
import { getExpertiseIcon } from "@/components/experts/expert-icons";
import { FadeIn } from "@/components/ui/FadeIn";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getCmsIcon } from "@/lib/cms-icons";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";
import {
  DEFAULT_HOMEPAGE_WELLNESS_EXPERT,
  type HomepageWellnessExpertCms,
} from "@/lib/homepage-wellness-expert";

const DEFAULT_EXPERTISE_TAGS = [
  "Integrative Healthcare",
  "Herbal Wellness",
  "Preventive Lifestyle",
  "Supplement Education",
] as const;

export function WellnessExpertSection({
  expert,
  section,
  cms,
}: {
  expert: Expert | null;
  section?: HomepageSectionConfig;
  cms?: HomepageWellnessExpertCms;
}) {
  const settings = cms?.settings || DEFAULT_HOMEPAGE_WELLNESS_EXPERT.settings;
  const BadgeIcon = getCmsIcon(settings.badge_icon);
  const expertiseTags = expert?.expertise_tags?.slice(0, 4).filter(Boolean);
  const spotlight = {
    name: expert?.name || settings.fallback_name,
    designation: expert?.designation || settings.fallback_designation,
    profileImage: expert?.profile_image || settings.fallback_image,
    trustLine: settings.trust_line,
    expertiseTags: expertiseTags?.length ? expertiseTags : DEFAULT_EXPERTISE_TAGS,
    description: expert?.short_bio || settings.fallback_bio,
    secondary:
      expert?.full_bio?.split(/\n+/).map((item) => item.trim()).find(Boolean) ||
      settings.fallback_secondary_bio,
  };
  const ctaLabel = section?.cta_label || "Explore Our Experts";
  const ctaUrl = section?.cta_url || "/experts";

  return (
    <SectionWrapper id="wellness-expert" tone="white">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-pill border border-primary/12 bg-white px-4 py-2 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <BadgeIcon className="size-4 text-gold" aria-hidden="true" />
          {settings.badge_text}
        </p>
        <h2 className="mt-5 font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl lg:text-5xl">
          {section?.title || "Meet Our Wellness Expert"}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-muted">
          {section?.subtitle ||
            "Our educational wellness content and ingredient resources are supported by expert guidance to help readers make more informed wellness decisions."}
        </p>
      </FadeIn>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-90px" }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        whileHover={{ y: -4 }}
        className="relative mx-auto mt-12 max-w-6xl overflow-hidden rounded-[24px] border border-border-light bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(234,244,236,0.94)_52%,rgba(255,255,255,0.96))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-8 lg:p-10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(11,93,59,0.08)_0%,rgba(255,255,255,0)_34%),radial-gradient(circle_at_86%_30%,rgba(217,165,32,0.12)_0%,rgba(255,255,255,0)_28%)]"
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative size-36 overflow-hidden rounded-full border-[6px] border-white bg-soft-green shadow-[0_24px_50px_rgba(15,23,42,0.14)] md:size-40 lg:size-44">
              {spotlight.profileImage ? (
                <Image
                  src={spotlight.profileImage}
                  alt={spotlight.name}
                  fill
                  sizes="(max-width: 768px) 144px, (max-width: 1024px) 160px, 176px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-primary">
                  <Stethoscope className="size-14" aria-hidden="true" />
                </div>
              )}
            </div>

            <h3 className="mt-6 font-heading text-3xl font-extrabold text-text-dark">
              {spotlight.name}
            </h3>
            <p className="mt-2 text-base font-semibold text-primary">
              {spotlight.designation}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">{spotlight.trustLine}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              {spotlight.expertiseTags.map((tag) => {
                const Icon = getExpertiseIcon(tag);

                return (
                  <motion.span
                    key={tag}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-soft-green/70 px-4 py-2 text-sm font-semibold text-text-dark shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                  >
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                    {tag}
                  </motion.span>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)] backdrop-blur-sm md:p-7 lg:p-8">
            <p className="inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <Stethoscope className="size-3.5 text-gold" aria-hidden="true" />
              About {spotlight.name}
            </p>

            <p className="mt-5 text-base leading-8 text-muted">{spotlight.description}</p>
            <p className="mt-4 text-base leading-8 text-muted">{spotlight.secondary}</p>

            {ctaLabel && ctaUrl ? (
              <div className="mt-7 flex justify-center lg:justify-start">
                <PremiumButton
                  href={ctaUrl}
                  className="w-full sm:w-auto"
                  icon={<ArrowRight className="size-4" aria-hidden="true" />}
                >
                  {ctaLabel}
                </PremiumButton>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
