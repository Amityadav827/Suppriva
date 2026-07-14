"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CircleHelp } from "lucide-react";
import { KeyboardEvent, useRef, useState } from "react";

export type BlogArticleFaqItem = {
  question: string;
  answerHtml: string;
};

export function BlogArticleFaqAccordion({
  heading,
  faqs,
}: {
  heading: string;
  faqs: BlogArticleFaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusButton(index: number) {
    buttonRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusButton((index + 1) % faqs.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusButton((index - 1 + faqs.length) % faqs.length);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusButton(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusButton(faqs.length - 1);
    }
  }

  return (
    <section className="my-10 rounded-[28px] border border-border-light bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-6">
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-soft-green text-primary shadow-[0_12px_32px_rgba(16,110,70,0.12)] md:size-16">
          <CircleHelp className="size-7 md:size-8" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl">
          {heading}
        </h2>
      </div>

      <div className="mt-6 grid gap-4">
        {faqs.map((faq, index) => {
          const active = openIndex === index;
          const buttonId = `blog-article-faq-button-${index}`;
          const panelId = `blog-article-faq-panel-${index}`;

          return (
            <div
              key={`${faq.question}-${index}`}
              className="overflow-hidden rounded-[24px] border border-border-light bg-white shadow-[0_16px_42px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_24px_58px_rgba(15,23,42,0.1)]"
            >
              <button
                ref={(node) => {
                  buttonRefs.current[index] = node;
                }}
                id={buttonId}
                type="button"
                aria-expanded={active}
                aria-controls={panelId}
                onClick={() => setOpenIndex(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className="flex min-h-[64px] w-full items-center justify-between gap-4 px-5 py-4 text-left font-heading text-lg font-bold leading-snug text-text-dark transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 md:min-h-[74px] md:px-6 md:py-5 md:text-[22px]"
              >
                <span>{faq.question}</span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-soft-green text-primary shadow-[0_10px_24px_rgba(16,110,70,0.1)] md:size-10">
                  <ChevronDown
                    className={`size-4 transition duration-300 md:size-5 ${active ? "rotate-180 text-gold" : ""}`}
                    aria-hidden="true"
                  />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {active ? (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="border-t border-border-light px-5 py-4 text-base leading-8 text-muted md:px-6 md:py-5 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:decoration-gold/50 [&_a]:underline-offset-4 [&_strong]:text-text-dark"
                      dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
