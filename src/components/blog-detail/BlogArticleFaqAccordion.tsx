"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
    <section className="my-8 rounded-[30px] border border-border-light bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] md:p-8">
      <h2 className="font-heading text-3xl font-extrabold leading-tight text-text-dark md:text-4xl">
        {heading}
      </h2>

      <div className="mt-8 grid gap-5">
        {faqs.map((faq, index) => {
          const active = openIndex === index;
          const buttonId = `blog-article-faq-button-${index}`;
          const panelId = `blog-article-faq-panel-${index}`;

          return (
            <div
              key={`${faq.question}-${index}`}
              className="overflow-hidden rounded-[24px] border border-border-light bg-white shadow-[0_14px_40px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
            >
              <button
                ref={(node) => {
                  buttonRefs.current[index] = node;
                }}
                id={buttonId}
                type="button"
                aria-expanded={active}
                aria-controls={panelId}
                onClick={() => setOpenIndex(active ? -1 : index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className="flex min-h-[76px] w-full items-center justify-between gap-5 px-6 py-5 text-left font-heading text-lg font-extrabold leading-snug text-text-dark transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 md:px-7 md:py-6 md:text-xl"
              >
                <span>{faq.question}</span>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-soft-green text-primary">
                  <ChevronDown
                    className={`size-5 transition duration-300 ${active ? "rotate-180 text-gold" : ""}`}
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
                    transition={{ duration: 0.26, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="border-t border-border-light px-6 py-5 text-base leading-8 text-muted md:px-7 md:py-6 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:decoration-gold/50 [&_a]:underline-offset-4 [&_strong]:text-text-dark"
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
