"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PremiumButtonProps = Omit<HTMLMotionProps<"a">, "children"> & {
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  children: ReactNode;
};

export function PremiumButton({
  className,
  variant = "primary",
  icon,
  children,
  ...props
}: PremiumButtonProps) {
  return (
    <motion.a
      whileHover={{ scale: 1.035, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "inline-flex min-h-14 items-center justify-center gap-2 rounded-pill px-7 font-heading text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:min-w-44",
        variant === "primary"
          ? "bg-primary text-white shadow-premium hover:bg-button-hover hover:shadow-premium-hover"
          : "border border-border-light bg-white text-primary shadow-[0_18px_48px_rgba(15,23,42,0.08)] hover:border-gold hover:text-dark-green",
        className,
      )}
      {...props}
    >
      {children}
      {icon}
    </motion.a>
  );
}
