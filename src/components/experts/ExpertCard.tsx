"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Stethoscope } from "lucide-react";
import type { Expert } from "@/lib/database/types";
import { getExpertiseIcon } from "@/components/experts/expert-icons";

export function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="group overflow-hidden rounded-[28px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-primary/25 hover:shadow-[0_28px_70px_rgba(11,93,59,0.12)]"
    >
      <div className="flex items-start gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-4 border-soft-green bg-soft-green shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
          {expert.profile_image ? (
            <Image
              src={expert.profile_image}
              alt={expert.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary">
              <Stethoscope className="size-8" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-extrabold text-text-dark">
            {expert.name}
          </h2>
          {expert.designation ? (
            <p className="mt-1 text-sm font-semibold text-primary">{expert.designation}</p>
          ) : null}
          {expert.experience_years ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {expert.experience_years}+ years experience
            </p>
          ) : null}
        </div>
      </div>

      {expert.short_bio ? (
        <p className="mt-5 text-sm leading-7 text-muted">{expert.short_bio}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {expert.expertise_tags.slice(0, 4).map((tag) => {
          const Icon = getExpertiseIcon(tag);

          return (
            <span
              key={tag}
              className="inline-flex items-center gap-2 rounded-pill bg-soft-green/80 px-3 py-1.5 text-xs font-semibold text-text-dark"
            >
              <Icon className="size-3.5 text-primary" aria-hidden="true" />
              {tag}
            </span>
          );
        })}
      </div>

      <Link
        href={`/experts/${expert.slug}`}
        className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition group-hover:translate-x-1"
      >
        View Profile
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </motion.article>
  );
}
