"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Leaf, Sparkles } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

export function NewsletterSection() {
  return (
    <section
      id="newsletter"
      className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#041f13_0%,#063921_42%,#0B5D3B_100%)] py-[64px] md:py-[78px] lg:py-[86px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_19%_24%,rgba(217,165,32,0.26)_0%,rgba(217,165,32,0)_28%),radial-gradient(circle_at_72%_42%,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_24%),radial-gradient(circle_at_88%_85%,rgba(14,122,79,0.45)_0%,rgba(14,122,79,0)_30%)]"
      />
      <span
        aria-hidden="true"
        className="absolute left-8 top-12 -z-10 h-24 w-12 rotate-[-32deg] rounded-[100%_0_100%_0] bg-white/8 blur-[1px]"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-12 right-10 -z-10 h-28 w-14 rotate-[35deg] rounded-[100%_0_100%_0] bg-gold/14 blur-[1px]"
      />

      <div className="site-container">
        <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-white/[0.055] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.22)] backdrop-blur md:p-8 lg:p-9">
          <div
            aria-hidden="true"
            className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-gold/14 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -right-16 top-0 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[1fr_0.95fr] lg:gap-12 xl:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative text-center lg:text-left"
            >
              <motion.div
                aria-hidden="true"
                animate={{ opacity: [0.32, 0.58, 0.32], scale: [1, 1.05, 1] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -left-10 top-12 hidden h-40 w-40 rounded-full bg-gold/16 blur-3xl lg:block"
              />
              <Leaf
                className="absolute right-6 top-2 hidden size-7 rotate-[28deg] text-gold/28 lg:block"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-2 rounded-pill border border-gold/24 bg-gold/12 px-4 py-2 font-heading text-sm font-semibold text-white shadow-[0_12px_34px_rgba(0,0,0,0.12)] backdrop-blur">
                <Sparkles className="size-4 text-gold" aria-hidden="true" />
                Premium Wellness Insider
              </span>

              <h2 className="relative mt-5 max-w-3xl font-heading text-3xl font-extrabold leading-[1.18] text-white md:text-4xl lg:text-5xl lg:leading-[1.14]">
                Stay Updated With Health & Wellness Tips
              </h2>
              <p className="mx-auto mt-5 max-w-[590px] text-base leading-8 text-white/84 lg:mx-0">
                Subscribe to get exclusive offers, wellness tips, and the latest
                supplement insights.
              </p>

              <div className="mx-auto mt-6 h-px w-28 bg-gradient-to-r from-transparent via-gold/70 to-transparent lg:mx-0 lg:w-40 lg:from-gold/70 lg:via-white/18" />

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:max-w-[560px]">
                {[
                  "Trusted by 10,000+ wellness readers",
                  "Weekly expert supplement insights",
                ].map((text) => (
                  <motion.div
                    key={text}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-center gap-2 rounded-pill border border-white/10 bg-white/[0.065] px-4 py-3 text-sm text-white/86 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:justify-start"
                  >
                    <BadgeCheck
                      className="size-4 shrink-0 text-gold"
                      aria-hidden="true"
                    />
                    <span>{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
