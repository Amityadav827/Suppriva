"use client";

import type { LucideIcon } from "lucide-react";

export function InputField({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  name,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon: LucideIcon;
  name: string;
}) {
  return (
    <label className="block">
      <span className="font-heading text-sm font-semibold text-text-dark">
        {label}
      </span>
      <span className="mt-2 flex min-h-14 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition duration-300 focus-within:border-gold/70 focus-within:shadow-[0_16px_38px_rgba(217,165,32,0.14)]">
        <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete="off"
          suppressHydrationWarning
          className="min-w-0 flex-1 bg-transparent text-sm text-text-dark outline-none placeholder:text-muted"
        />
      </span>
    </label>
  );
}
