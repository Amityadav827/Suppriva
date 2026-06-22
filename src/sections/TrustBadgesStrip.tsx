"use client";

import { motion } from "framer-motion";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { trustBadges } from "@/lib/constants";

export function TrustBadgesStrip() {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(90deg,#063921,#0B5D3B)] py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_30%,rgba(217,165,32,0.18)_0%,rgba(217,165,32,0)_30%),radial-gradient(circle_at_82%_70%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_26%)]"
      />
      <div className="site-container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-2xl font-extrabold leading-tight text-white md:text-3xl xl:text-4xl">
            Why Thousands Start Their Wellness Journey with Suppriva
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/78 md:text-base">
            Discover supplements, ingredients, wellness solutions, and expert
            insights designed to help you make informed health decisions.
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
          {trustBadges.map((badge) => (
            <TrustBadge key={badge.title} badge={badge} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
