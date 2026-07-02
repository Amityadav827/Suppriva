import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionWrapperProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "cream" | "white";
  style?: CSSProperties;
};

export function SectionWrapper({
  id,
  children,
  className,
  tone = "cream",
  style,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      style={style}
      className={cn(
        "relative isolate overflow-hidden py-[72px] md:py-[92px] lg:py-[100px]",
        tone === "cream" ? "bg-cream" : "bg-white",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_22%,rgba(234,244,236,0.82)_0%,rgba(247,246,242,0)_31%),radial-gradient(circle_at_84%_30%,rgba(217,165,32,0.14)_0%,rgba(247,246,242,0)_28%)]"
      />
      <span
        aria-hidden="true"
        className="absolute left-4 top-20 -z-10 h-20 w-10 rotate-[-32deg] rounded-[100%_0_100%_0] bg-primary/8 blur-[1px] md:left-10 md:h-28 md:w-14"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-20 right-6 -z-10 h-24 w-12 rotate-[36deg] rounded-[100%_0_100%_0] bg-gold/10 blur-[1px] md:right-16 md:h-32 md:w-16"
      />
      <div className="site-container">{children}</div>
    </section>
  );
}
