import { Settings } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { settingsCards } from "@/lib/dashboard-data";

export default function SettingsAdminPage() {
  return (
    <>
      <DashboardHeader
        title="Settings"
        subtitle="Manage global site settings, brand assets, social links, and newsletter preferences."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {settingsCards.map(([title, description]) => (
          <article
            key={title}
            className="rounded-[28px] border border-border-light bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-premium"
          >
            <span className="grid size-12 place-items-center rounded-full bg-soft-green text-primary">
              <Settings className="size-5" />
            </span>
            <h2 className="mt-5 font-heading text-xl font-extrabold text-text-dark">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </article>
        ))}
      </div>
    </>
  );
}
