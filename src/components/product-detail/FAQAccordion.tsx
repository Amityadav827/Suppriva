"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FAQAccordion({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-4xl">
      {faqs.map((faq, index) => {
        const active = open === index;

        return (
          <div
            key={faq.question}
            className="mb-3 overflow-hidden rounded-[24px] border border-border-light bg-white shadow-[0_14px_38px_rgba(15,23,42,0.05)]"
          >
            <button
              type="button"
              onClick={() => setOpen(active ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-heading text-base font-extrabold text-text-dark transition hover:text-primary"
            >
              {faq.question}
              <ChevronDown
                className={`size-5 shrink-0 transition duration-300 ${active ? "rotate-180 text-gold" : "text-primary"}`}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence initial={false}>
              {active ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <p className="border-t border-border-light px-5 py-5 text-sm leading-7 text-muted">
                    {faq.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
