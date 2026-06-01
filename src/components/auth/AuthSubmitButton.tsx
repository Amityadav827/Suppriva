"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function AuthSubmitButton({
  label,
  loading = false,
}: {
  label: string;
  loading?: boolean;
}) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: 1.025, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.28 }}
      className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-[linear-gradient(90deg,#063921,#0B5D3B,#0E7A4F)] px-7 font-heading text-sm font-semibold text-white shadow-[0_18px_46px_rgba(11,93,59,0.28)] transition duration-300 hover:shadow-[0_24px_60px_rgba(217,165,32,0.26)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Please wait..." : label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </motion.button>
  );
}
