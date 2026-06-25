"use client";

import Image from "next/image";
import type { Expert } from "@/lib/database/types";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Stethoscope } from "lucide-react";
import { getExpertiseIcon } from "@/components/experts/expert-icons";
import { FadeIn } from "@/components/ui/FadeIn";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

const DEFAULT_EXPERTISE_TAGS = [
  "Integrative Healthcare",
  "Herbal Wellness",
  "Preventive Lifestyle",
  "Supplement Education",
] as const;

const FALLBACK_EXPERT = {
  name: "Dr. Arindham Chatterjee",
  designation: "Medical & Wellness Advisor",
  profileImage:
    "https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg",
  expertiseTags: DEFAULT_EXPERTISE_TAGS,
  description:
    "Dr. Arindham Chatterjee contributes expert guidance to Suppriva's educational wellness content and ingredient resources, helping readers better understand ingredients, wellness goals, and healthy lifestyle practices.",
  secondary:
    "His focus includes wellness education, preventive lifestyle strategies, ingredient awareness, and supporting readers with evidence-informed wellness knowledge.",
} as const;

export function WellnessExpertSection({ expert }: { expert: Expert | null }) {
  const expertiseTags = expert?.expertise_tags?.slice(0, 4).filter(Boolean);
  const spotlight = {
    name: expert?.name || FALLBACK_EXPERT.name,
    designation: expert?.designation || FALLBACK_EXPERT.designation,
    profileImage: expert?.profile_image || FALLBACK_EXPERT.profileImage,
    trustLine: "Wellness Education - Ingredient Research - Preventive Health",
    expertiseTags: expertiseTags?.length ? expertiseTags : FALLBACK_EXPERT.expertiseTags,
    description:
      expert?.short_bio ||
      FALLBACK_EXPERT.description,
    secondary:
      expert?.full_bio?.split(/\n+/).map((item) => item.trim()).find(Boolean) ||
      FALLBACK_EXPERT.secondary,
  };

  return (
    <SectionWrapper id="wellness-expert" tone="white">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-pill border border-primary/12 bg-white px-4 py-2 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <ShieldCheck className="size-4 text-gold" aria-hidden="true" />
          Medical &amp; Editorial Advisory
        </p>
        <h2 className="mt-5 font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl lg:text-5xl">
          Meet Our Wellness Expert
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-muted">
          Our educational wellness content and ingredient resources are supported by
          expert guidance to help readers make more informed wellness decisions.
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

            <div className="mt-7 flex justify-center lg:justify-start">
              <PremiumButton
                href="/experts"
                className="w-full sm:w-auto"
                icon={<ArrowRight className="size-4" aria-hidden="true" />}
              >
                Explore Our Experts
              </PremiumButton>
            </div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
