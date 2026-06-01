"use client";

import { Bell, Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function Topbar() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-heading text-xl font-extrabold text-text-dark">
          Admin Dashboard
        </p>
        <p className="text-sm text-muted">Manage Suppriva content and affiliate assets.</p>
      </div>
      <div className="hidden min-h-12 w-full max-w-sm items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:flex">
        <Search className="size-4 text-primary" aria-hidden="true" />
        <input
          placeholder="Search admin..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-11 place-items-center rounded-full border border-border-light bg-white text-primary shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
        >
          <Bell className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Logout"
          onClick={() => void handleLogout()}
          className="grid size-11 place-items-center rounded-full bg-primary text-white shadow-[0_12px_30px_rgba(11,93,59,0.18)]"
        >
          <UserRound className="size-5" />
        </button>
      </div>
    </div>
  );
}
