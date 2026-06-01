"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GridWrapperProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
};

export function GridWrapper({
  children,
  className,
  stagger = 0.07,
}: GridWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
