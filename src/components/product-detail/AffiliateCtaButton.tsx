"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { AffiliateLink } from "@/components/seo/AffiliateLink";

function getSessionId() {
  const key = "suppriva_affiliate_session";
  const existingSession = window.localStorage.getItem(key);

  if (existingSession) {
    return existingSession;
  }

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(key, sessionId);

  return sessionId;
}

export function AffiliateCtaButton({
  productId,
  productSlug,
  affiliateUrl = "/products",
  label = "Visit Official Website",
  className = "",
  variant = "solid",
}: {
  productId?: string;
  productSlug: string;
  affiliateUrl?: string;
  label?: string;
  className?: string;
  variant?: "solid" | "outline";
}) {
  const sourcePage = useMemo(() => `/product/${productSlug}`, [productSlug]);

  async function trackClick() {
    try {
      await fetch("/api/affiliate-clicks/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          product_id: productId,
          product_slug: productSlug,
          source_page: sourcePage,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          session_id: getSessionId(),
        }),
      });
    } catch {
      // Tracking should never block the outbound affiliate action.
    }
  }

  const baseClasses =
    "mt-0 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill px-5 font-heading text-[12px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap transition duration-300 sm:min-h-14 sm:w-auto sm:px-6";

  const variantClasses =
    variant === "outline"
      ? "border border-primary bg-white text-primary shadow-[0_14px_34px_rgba(15,23,42,0.06)] hover:bg-primary hover:text-white hover:shadow-[0_20px_48px_rgba(11,93,59,0.18)]"
      : "bg-[linear-gradient(90deg,#063921,#0B5D3B,#0E7A4F)] text-white shadow-[0_18px_46px_rgba(11,93,59,0.26)] hover:shadow-[0_24px_60px_rgba(217,165,32,0.24)]";

  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <AffiliateLink
        href={affiliateUrl}
        onClick={() => void trackClick()}
        className={`${baseClasses} ${variantClasses} ${className}`.trim()}
      >
        {label}
        <ArrowRight className="size-4" aria-hidden="true" />
      </AffiliateLink>
    </motion.div>
  );
}
