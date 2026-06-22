"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { HeroProductShowcase } from "@/components/hero/HeroProductShowcase";
import { FadeIn } from "@/components/ui/FadeIn";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { trustItems } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-cream py-[72px] md:py-[92px] lg:py-[100px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_22%,rgba(234,244,236,0.95)_0%,rgba(247,246,242,0)_32%),radial-gradient(circle_at_83%_30%,rgba(217,165,32,0.18)_0%,rgba(247,246,242,0)_28%),linear-gradient(180deg,#F7F6F2_0%,#FFFFFF_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -left-14 top-28 -z-10 h-64 w-64 rounded-full bg-soft-green/75 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-20 right-0 -z-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="site-container grid items-center gap-14 lg:grid-cols-[1fr_0.96fr] lg:gap-12 xl:gap-20">
        <div className="mx-auto max-w-[680px] text-center lg:mx-0 lg:text-left">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-white px-4 py-2 font-heading text-sm font-semibold text-primary shadow-[0_14px_36px_rgba(6,57,33,0.08)]">
              <CheckCircle2 className="size-4 text-gold" aria-hidden="true" />
              Wellness Discovery Platform
            </span>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="mt-7 font-heading text-3xl font-extrabold leading-[1.08] text-text-dark md:text-4xl xl:text-6xl">
              Discover Wellness Solutions{" "}
              <span className="text-gold">That Fit Your Goals</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-[620px] text-base leading-8 text-muted lg:mx-0">
              Explore supplements, ingredient insights, and wellness
              collections designed to help you make informed health decisions
              with confidence.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-9 grid gap-3 sm:flex sm:justify-center lg:justify-start">
              <PremiumButton href="/category" icon={<ArrowRight className="size-4" />}>
                Explore Wellness Categories
              </PremiumButton>
              <PremiumButton href="/ingredients" variant="secondary" icon={<ArrowRight className="size-4" />}>
                Explore Ingredients
              </PremiumButton>
            </div>
          </FadeIn>

          <FadeIn delay={0.32}>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {trustItems.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -5, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    className="group flex min-h-[120px] items-start gap-3 rounded-card border border-border-light bg-white/82 p-4 text-left shadow-[0_14px_38px_rgba(15,23,42,0.05)] backdrop-blur transition duration-300 hover:border-gold/70 hover:shadow-premium"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-soft-green text-primary transition duration-300 group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-heading text-sm font-semibold leading-5 text-text-dark">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted">
                        {item.description}
                      </span>
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </FadeIn>
        </div>

        <HeroProductShowcase />
      </div>
    </section>
  );
}
