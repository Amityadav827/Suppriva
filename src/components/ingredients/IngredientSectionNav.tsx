"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";

export type IngredientSectionLink = {
  id: string;
  label: string;
};

type IngredientSectionNavProps = {
  sections: IngredientSectionLink[];
  mobile?: boolean;
};

const DESKTOP_OFFSET = 112;
const MOBILE_OFFSET = 96;

export function IngredientSectionNav({
  sections,
  mobile = false,
}: IngredientSectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);

  useEffect(() => {
    if (!sectionIds.length) {
      return;
    }

    const updateActiveSection = () => {
      const offset = mobile ? MOBILE_OFFSET : DESKTOP_OFFSET;
      let currentActive = sectionIds[0];

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) {
          continue;
        }

        const top = element.getBoundingClientRect().top;
        if (top - offset <= 0) {
          currentActive = id;
        }
      }

      setActiveId(currentActive);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [mobile, sectionIds]);

  const scrollToSection = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const section = document.getElementById(id);

    if (!section) {
      return;
    }

    const offset = mobile ? MOBILE_OFFSET : DESKTOP_OFFSET;
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <div
      className={cn(
        "rounded-[28px] border border-border-light bg-white/95 p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] backdrop-blur-sm",
        !mobile && "xl:max-w-[320px]",
      )}
    >
      <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
        On This Page
      </p>
      <div className={mobile ? "mt-4 flex gap-2 overflow-x-auto pb-1" : "mt-4 space-y-2"}>
        {sections.map((section) => {
          const isActive = section.id === activeId;

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={scrollToSection(section.id)}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "group inline-flex items-center gap-3 rounded-pill border px-4 py-3 text-sm font-semibold transition duration-200",
                mobile ? "shrink-0 whitespace-nowrap" : "w-full justify-between",
                isActive
                  ? "border-primary/15 bg-primary text-white shadow-[0_16px_34px_rgba(11,93,59,0.22)]"
                  : "border-border-light bg-cream/55 text-text-dark hover:border-gold/60 hover:bg-white hover:text-primary",
              )}
            >
              <span>{section.label}</span>
              {!mobile ? (
                <ArrowUpRight
                  className={cn(
                    "size-4 transition",
                    isActive ? "text-white" : "text-muted group-hover:text-primary",
                  )}
                />
              ) : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}
