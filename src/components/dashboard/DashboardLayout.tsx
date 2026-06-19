"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(135deg,#F7F6F2,#FFFFFF_52%,#EAF4EC)]">
      <div className="flex h-screen max-w-full overflow-hidden">
        <Sidebar className="sticky top-0 hidden lg:flex" />

        <AnimatePresence>
          {open ? (
            <>
              <motion.button
                type="button"
                aria-label="Close dashboard navigation"
                className="fixed inset-0 z-40 bg-dark-green/45 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
              <motion.div
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.32, ease: "easeOut" }}
              >
                <Sidebar onNavigate={() => setOpen(false)} />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="sticky top-0 z-30 border-b border-border-light bg-white/78 backdrop-blur-xl">
            <div className="flex h-20 items-center gap-4 px-4 md:px-7">
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((value) => !value)}
                className="grid size-11 place-items-center rounded-full border border-border-light bg-white text-primary shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:hidden"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <Topbar />
            </div>
          </div>

          <main className="min-w-0 max-w-full overflow-x-hidden px-4 py-6 md:px-7 md:py-8 lg:px-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
