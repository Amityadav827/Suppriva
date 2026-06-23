"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpenText,
  BriefcaseMedical,
  ExternalLink,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

const EXPERT_IMAGE =
  "https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg";
const EXPERT_LINK =
  "https://www.linkedin.com/in/dr-arindham-chatterjee-2b1b6716/";

const expertiseTags = [
  { label: "Integrative Healthcare", icon: HeartPulse },
  { label: "Herbal Wellness", icon: Leaf },
  { label: "Preventive Lifestyle", icon: ShieldCheck },
  { label: "Supplement Education", icon: BookOpenText },
] as const;

export function WellnessExpertSection() {
  return (
    <SectionWrapper id="wellness-expert" tone="white">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-pill border border-primary/12 bg-white px-4 py-2 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <Stethoscope className="size-4 text-gold" aria-hidden="true" />
          Medical &amp; Editorial Advisory
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <BriefcaseMedical className="size-6 text-gold" aria-hidden="true" />
          <h2 className="font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl lg:text-4xl">
            Meet Our Wellness Expert
          </h2>
          <Leaf className="size-6 rotate-[18deg] text-primary" aria-hidden="true" />
        </div>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted">
          Our educational wellness content and ingredient resources are supported
          by expert guidance to help readers make more informed wellness decisions.
        </p>
      </FadeIn>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-90px" }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        whileHover={{ y: -4 }}
        className="relative mt-12 overflow-hidden rounded-[24px] border border-border-light bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(234,244,236,0.96)_52%,rgba(255,255,255,0.94))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:mt-14 md:p-8 lg:p-10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(11,93,59,0.08)_0%,rgba(255,255,255,0)_34%),radial-gradient(circle_at_84%_26%,rgba(217,165,32,0.12)_0%,rgba(255,255,255,0)_28%)]"
        />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative size-36 overflow-hidden rounded-full border-[6px] border-white bg-soft-green shadow-[0_24px_50px_rgba(15,23,42,0.14)] md:size-40 lg:size-44">
              <Image
                src={EXPERT_IMAGE}
                alt="Dr. Arindham Chatterjee"
                fill
                sizes="(max-width: 768px) 144px, (max-width: 1024px) 160px, 176px"
                className="object-cover"
              />
            </div>

            <h3 className="mt-6 font-heading text-3xl font-extrabold text-text-dark">
              Dr. Arindham Chatterjee
            </h3>
            <p className="mt-2 text-base font-semibold text-primary">
              Medical &amp; Wellness Advisor
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Wellness Education • Ingredient Research • Preventive Health
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              {expertiseTags.map((tag) => (
                <motion.span
                  key={tag.label}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-soft-green/70 px-4 py-2 text-sm font-semibold text-text-dark shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                >
                  <tag.icon className="size-4 text-primary" aria-hidden="true" />
                  {tag.label}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/78 p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)] backdrop-blur-sm md:p-7 lg:p-8">
            <p className="inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <BriefcaseMedical className="size-3.5 text-gold" aria-hidden="true" />
              About Dr. Arindham Chatterjee
            </p>

            <p className="mt-5 text-base leading-8 text-muted">
              Dr. Arindham Chatterjee contributes expert guidance to Suppriva&apos;s
              educational wellness content and ingredient resources, helping readers
              better understand ingredients, wellness goals, and healthy lifestyle
              practices.
            </p>

            <p className="mt-4 text-base leading-8 text-muted">
              His focus includes wellness education, preventive lifestyle
              strategies, ingredient awareness, and supporting readers with
              evidence-informed wellness knowledge.
            </p>

            <div className="mt-7 flex justify-center lg:justify-start">
              <PremiumButton
                href={EXPERT_LINK}
                target="_blank"
                rel="nofollow noopener noreferrer"
                variant="primary"
                className="w-full sm:w-auto"
                icon={<ExternalLink className="size-4" aria-hidden="true" />}
              >
                View Full Profile
              </PremiumButton>
            </div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}

