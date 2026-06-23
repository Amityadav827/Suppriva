"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Stethoscope } from "lucide-react";
import type { Expert } from "@/lib/database/types";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { getExpertiseIcon } from "@/components/experts/expert-icons";

type FeaturedExpertCardProps = {
  expert: Expert;
  ctaLabel: string;
  ctaHref: string;
  external?: boolean;
  showAboutLabel?: boolean;
  className?: string;
};

export function FeaturedExpertCard({
  expert,
  ctaLabel,
  ctaHref,
  external = false,
  showAboutLabel = true,
  className = "",
}: FeaturedExpertCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-[24px] border border-border-light bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(234,244,236,0.96)_52%,rgba(255,255,255,0.94))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-8 lg:p-10 ${className}`.trim()}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(11,93,59,0.08)_0%,rgba(255,255,255,0)_34%),radial-gradient(circle_at_84%_26%,rgba(217,165,32,0.12)_0%,rgba(255,255,255,0)_28%)]"
      />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="relative size-36 overflow-hidden rounded-full border-[6px] border-white bg-soft-green shadow-[0_24px_50px_rgba(15,23,42,0.14)] md:size-40 lg:size-44">
            {expert.profile_image ? (
              <Image
                src={expert.profile_image}
                alt={expert.name}
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
            {expert.name}
          </h3>
          {expert.designation ? (
            <p className="mt-2 text-base font-semibold text-primary">{expert.designation}</p>
          ) : null}
          {expert.experience_years ? (
            <p className="mt-3 text-sm leading-7 text-muted">
              {expert.experience_years}+ years of experience
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
            {expert.expertise_tags.slice(0, 4).map((tag) => {
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

        <div className="rounded-[24px] border border-white/70 bg-white/78 p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)] backdrop-blur-sm md:p-7 lg:p-8">
          {showAboutLabel ? (
            <p className="inline-flex items-center gap-2 rounded-pill bg-gold/10 px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <Stethoscope className="size-3.5 text-gold" aria-hidden="true" />
              About {expert.name}
            </p>
          ) : null}

          {expert.short_bio ? (
            <p className={`${showAboutLabel ? "mt-5" : ""} text-base leading-8 text-muted`}>
              {expert.short_bio}
            </p>
          ) : null}

          {expert.full_bio ? (
            <p className="mt-4 text-base leading-8 text-muted">
              {expert.full_bio.split(/\n+/).find(Boolean)}
            </p>
          ) : null}

          <div className="mt-7 flex justify-center lg:justify-start">
            <PremiumButton
              href={ctaHref}
              {...(external
                ? {
                    target: "_blank",
                    rel: "nofollow noopener noreferrer",
                  }
                : {})}
              variant="primary"
              className="w-full sm:w-auto"
              icon={
                external ? (
                  <ExternalLink className="size-4" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-4" aria-hidden="true" />
                )
              }
            >
              {ctaLabel}
            </PremiumButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
