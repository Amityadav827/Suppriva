"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[linear-gradient(90deg,#063921,#0B5D3B)] shadow-[0_18px_50px_rgba(6,57,33,0.18)]">
      <nav
        aria-label="Primary navigation"
        className="site-container flex min-h-[82px] items-center gap-4 py-3 lg:min-h-[90px] lg:gap-7"
      >
        <Link href="/" className="shrink-0" aria-label="Suppriva home">
          <span className="block font-heading text-2xl font-extrabold tracking-[0.14em] text-white sm:text-[28px]">
            SUPPRIVA
          </span>
          <span className="mt-0.5 block font-heading text-[9px] font-semibold uppercase tracking-[0.22em] text-white/62 sm:text-[10px]">
            Your Supplement Destination
          </span>
        </Link>

        <SearchBar className="mx-auto hidden max-w-[520px] flex-1 md:flex xl:max-w-[620px]" />

        <div className="ml-auto hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-heading text-sm font-semibold text-white/82 transition duration-300 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex lg:ml-0">
          <IconButton label="Account" href="/login">
            <User className="size-5" aria-hidden="true" />
          </IconButton>
          <IconButton label="Products" href="/products" className="relative">
            <ShoppingCart className="size-5" aria-hidden="true" />
            <span className="absolute right-2 top-2 size-2.5 rounded-full bg-gold ring-2 ring-primary" />
          </IconButton>
        </div>

        <button
          type="button"
          className="ml-auto grid size-12 place-items-center rounded-full border border-white/12 bg-white/10 text-white backdrop-blur transition duration-300 hover:bg-white/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:hidden"
          aria-label="Open navigation menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </nav>

      <div className="site-container pb-4 md:hidden">
        <SearchBar />
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-40 cursor-default bg-dark-green/55 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              aria-label="Mobile navigation"
              className="fixed right-0 top-0 z-50 flex h-dvh w-[min(88vw,390px)] flex-col bg-[linear-gradient(180deg,#063921,#0B5D3B)] p-6 text-white shadow-[-24px_0_80px_rgba(0,0,0,0.26)] md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-[0.14em]">
                    SUPPRIVA
                  </p>
                  <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-white/62">
                    Your Supplement Destination
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/10 transition hover:bg-white/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              <SearchBar className="mt-8 shadow-[0_22px_54px_rgba(0,0,0,0.22)]" />

              <div className="mt-8 grid gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-4 font-heading text-base font-semibold text-white/86 transition duration-300 hover:bg-white/10 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
                <DrawerAction label="Account" href="/login" icon={<User className="size-5" />} />
                <DrawerAction
                  label="Products"
                  href="/products"
                  icon={<ShoppingCart className="size-5" />}
                  hasDot
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconButton({
  label,
  href,
  className,
  children,
}: {
  label: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "grid size-11 place-items-center rounded-full border border-white/12 bg-white/10 text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function DrawerAction({
  label,
  href,
  icon,
  hasDot,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  hasDot?: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative flex min-h-14 items-center justify-center gap-2 rounded-pill border border-white/12 bg-white/10 font-heading text-sm font-semibold transition hover:bg-white/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {icon}
      {label}
      {hasDot ? (
        <span className="absolute right-6 top-4 size-2.5 rounded-full bg-gold ring-2 ring-primary" />
      ) : null}
    </Link>
  );
}
