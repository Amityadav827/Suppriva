"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, Leaf, Sparkles } from "lucide-react";

export function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(135deg,#F7F6F2_0%,#FFFFFF_52%,#EAF4EC_100%)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_18%,rgba(217,165,32,0.18)_0%,rgba(217,165,32,0)_28%),radial-gradient(circle_at_86%_78%,rgba(11,93,59,0.14)_0%,rgba(11,93,59,0)_30%)]"
      />
      <div className="site-container grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <Link href="/" className="inline-block" aria-label="Suppriva home">
            <span className="block font-heading text-3xl font-extrabold tracking-[0.14em] text-primary">
              SUPPRIVA
            </span>
            <span className="mt-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              Your Supplement Destination
            </span>
          </Link>

          <div className="mt-12 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/10 bg-white px-4 py-2 font-heading text-sm font-semibold text-primary shadow-[0_14px_36px_rgba(6,57,33,0.08)]">
              <Sparkles className="size-4 text-gold" aria-hidden="true" />
              {eyebrow}
            </span>
            <h1 className="mt-6 font-heading text-5xl font-extrabold leading-[1.1] text-text-dark">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted">
              {subtitle}
            </p>
          </div>

          <div className="relative mt-10 h-[360px] max-w-[520px]">
            <motion.div
              aria-hidden="true"
              animate={{ scale: [1, 1.04, 1], opacity: [0.52, 0.78, 0.52] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/18 blur-3xl"
            />
            <Leaf
              aria-hidden="true"
              className="absolute right-12 top-8 size-8 rotate-[26deg] text-primary/18"
            />
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src="/assets/hero-supplements.webp"
                alt="Suppriva wellness supplements"
                fill
                sizes="520px"
                className="object-contain drop-shadow-[0_32px_38px_rgba(6,57,33,0.2)]"
              />
            </motion.div>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {["Premium wellness", "Secure access", "Curated insights"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border-light bg-white/80 p-3 font-heading text-sm font-semibold text-text-dark shadow-[0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur"
              >
                <BadgeCheck className="mb-2 size-4 text-gold" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        <section>{children}</section>
      </div>
    </main>
  );
}
