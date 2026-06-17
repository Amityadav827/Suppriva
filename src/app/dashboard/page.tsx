import { DashboardAnalyticsClient } from "@/components/dashboard/analytics/DashboardAnalyticsClient";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader
        title="Dashboard Overview"
        subtitle="Monitor Suppriva content, media assets, affiliate performance, subscriber growth, and editorial activity from one premium command center."
      />
      <DashboardAnalyticsClient />
    </>
  );
}
