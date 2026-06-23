"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  FlaskConical,
  FolderOpen,
  Images,
  LayoutDashboard,
  Microscope,
  MessageSquare,
  MessagesSquare,
  Package,
  SearchCheck,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Categories", href: "/dashboard/categories", icon: FolderOpen },
  { label: "Ingredients", href: "/dashboard/ingredients", icon: FlaskConical },
  { label: "Blogs", href: "/dashboard/blogs", icon: FileText },
  { label: "Authors", href: "/dashboard/authors", icon: Users },
  { label: "Reviewers", href: "/dashboard/reviewers", icon: Microscope },
  { label: "Media Library", href: "/dashboard/media-library", icon: Images },
  { label: "Contact", href: "/dashboard/contact-messages", icon: MessageSquare },
  { label: "Expert Queries", href: "/dashboard/expert-queries", icon: MessagesSquare },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "SEO", href: "/dashboard/seo", icon: SearchCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen w-[292px] shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,#063921,#0B5D3B)] p-5 text-white shadow-[24px_0_80px_rgba(6,57,33,0.16)]",
        className,
      )}
    >
      <Link href="/dashboard" className="block px-2" onClick={onNavigate}>
        <span className="block font-heading text-2xl font-extrabold tracking-[0.14em]">
          SUPPRIVA
        </span>
        <span className="mt-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-white/58">
          Admin Console
        </span>
      </Link>

      <nav className="mt-9 grid gap-2" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 font-heading text-sm font-semibold transition duration-300",
                active
                  ? "bg-white text-primary shadow-[0_16px_42px_rgba(0,0,0,0.16)]"
                  : "text-white/72 hover:bg-white/10 hover:text-gold",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[24px] border border-white/10 bg-white/[0.07] p-4">
        <BarChart3 className="size-5 text-gold" aria-hidden="true" />
        <p className="mt-3 font-heading text-sm font-semibold">
          Live analytics + assets
        </p>
        <p className="mt-1 text-xs leading-5 text-white/58">
          Media library, click trends, and subscriber growth all sync from Supabase.
        </p>
      </div>
    </aside>
  );
}
