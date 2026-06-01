"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerHref,
  footerLink,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText?: string;
  footerHref?: string;
  footerLink?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto w-full max-w-[520px] rounded-[34px] border border-white/70 bg-white/82 p-6 shadow-[0_34px_100px_rgba(6,57,33,0.14)] backdrop-blur-xl sm:p-8"
    >
      <div className="text-center">
        <Link href="/" className="inline-block lg:hidden">
          <span className="block font-heading text-2xl font-extrabold tracking-[0.14em] text-primary">
            SUPPRIVA
          </span>
        </Link>
        <h2 className="mt-4 font-heading text-3xl font-extrabold text-text-dark">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>
      </div>

      <div className="mt-7">{children}</div>

      {footerText && footerHref && footerLink ? (
        <p className="mt-7 text-center text-sm text-muted">
          {footerText}{" "}
          <Link
            href={footerHref}
            className="font-heading font-semibold text-primary transition hover:text-gold"
          >
            {footerLink}
          </Link>
        </p>
      ) : null}
    </motion.div>
  );
}
