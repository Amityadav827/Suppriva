import { DashboardAnalyticsClient } from "@/components/dashboard/analytics/DashboardAnalyticsClient";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px]">
      <DashboardHeader
        title="Dashboard Overview"
        subtitle="Monitor Suppriva content, media assets, affiliate performance, subscriber growth, and editorial activity from one premium command center."
      />
      <DashboardAnalyticsClient />
    </div>
  );
}
