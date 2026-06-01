"use client";

import { Leaf } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <FadeIn className="mx-auto max-w-3xl text-center">
      <div className="flex items-center justify-center gap-3">
        <Leaf className="size-6 rotate-[-18deg] text-gold" aria-hidden="true" />
        <h2 className="font-heading text-2xl font-extrabold leading-tight text-text-dark md:text-3xl lg:text-4xl">
          {title}
        </h2>
        <Leaf className="size-6 rotate-[18deg] text-primary" aria-hidden="true" />
      </div>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted">
          {subtitle}
        </p>
      ) : null}
    </FadeIn>
  );
}
