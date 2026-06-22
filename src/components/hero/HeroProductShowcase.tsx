"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function HeroProductShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      className="relative mx-auto flex min-h-[430px] w-full max-w-[620px] items-center justify-center sm:min-h-[560px] lg:max-w-[680px]"
      aria-label="Premium supplement product showcase"
    >
      <div className="absolute inset-x-8 top-10 h-[72%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.92)_0%,rgba(234,244,236,0.72)_42%,rgba(247,246,242,0)_72%)] blur-2xl" />

      <motion.div
        aria-hidden="true"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        className="absolute size-[300px] rounded-full border-[18px] border-gold/70 shadow-[0_0_90px_rgba(217,165,32,0.24)] sm:size-[420px] sm:border-[24px] lg:size-[470px]"
      />

      <div
        aria-hidden="true"
        className="absolute size-[250px] rounded-full border border-primary/10 bg-white/36 shadow-[inset_0_0_70px_rgba(255,255,255,0.85)] sm:size-[390px] lg:size-[430px]"
      />

      <Leaf className="left-4 top-24 rotate-[-32deg] bg-primary/18" />
      <Leaf className="right-7 top-28 rotate-[34deg] bg-gold/22" />
      <Leaf className="bottom-24 left-16 rotate-[24deg] bg-primary/16" />
      <Leaf className="bottom-16 right-14 rotate-[-38deg] bg-primary/14" />

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 h-[390px] w-[340px] sm:h-[530px] sm:w-[470px] lg:h-[590px] lg:w-[520px]"
      >
        <Image
          src="/assets/hero-supplements.webp"
          alt="Premium supplement bottles with green and gold packaging"
          fill
          priority
          sizes="(max-width: 640px) 340px, (max-width: 1024px) 470px, 520px"
          className="object-contain drop-shadow-[0_38px_42px_rgba(6,57,33,0.22)]"
        />
      </motion.div>
    </motion.div>
  );
}

function Leaf({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-0 h-16 w-8 rounded-[100%_0_100%_0] shadow-[0_16px_36px_rgba(6,57,33,0.08)] sm:h-24 sm:w-11 ${className}`}
    />
  );
}
