"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";

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
}: {
  productId?: string;
  productSlug: string;
  affiliateUrl?: string;
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

  return (
    <motion.a
      href={affiliateUrl}
      target={affiliateUrl.startsWith("http") ? "_blank" : undefined}
      rel={affiliateUrl.startsWith("http") ? "nofollow sponsored noopener noreferrer" : undefined}
      onClick={() => void trackClick()}
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-[linear-gradient(90deg,#063921,#0B5D3B,#0E7A4F)] px-7 font-heading text-sm font-semibold text-white shadow-[0_18px_46px_rgba(11,93,59,0.26)] transition duration-300 hover:shadow-[0_24px_60px_rgba(217,165,32,0.24)] sm:w-auto"
    >
      Visit Official Website
      <ArrowRight className="size-4" aria-hidden="true" />
    </motion.a>
  );
}
