"use client";

import { motion } from "framer-motion";

export function DashboardCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.38 }}
      className="rounded-[30px] border border-border-light bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] md:p-6"
    >
      <div className="mb-5">
        <h2 className="font-heading text-xl font-extrabold text-text-dark">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {children}
    </motion.section>
  );
}
