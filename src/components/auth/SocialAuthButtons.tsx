"use client";

import { motion } from "framer-motion";
import { Facebook } from "lucide-react";

export function SocialAuthButtons({ mode = "Continue" }: { mode?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SocialButton label={`${mode} with Google`} mark="G" />
      <SocialButton label={`${mode} with Facebook`} icon={<Facebook className="size-4" />} />
    </div>
  );
}

function SocialButton({
  label,
  mark,
  icon,
}: {
  label: string;
  mark?: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-text-dark shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:border-gold/70 hover:text-primary"
    >
      {mark ? (
        <span className="font-heading text-base font-extrabold text-primary">
          {mark}
        </span>
      ) : (
        icon
      )}
      {label}
    </motion.button>
  );
}
