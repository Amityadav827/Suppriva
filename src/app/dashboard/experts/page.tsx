import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardExpertsClient } from "@/components/dashboard/experts/DashboardExpertsClient";

export default function DashboardExpertsPage() {
  return (
    <>
      <DashboardHeader
        title="Experts"
        subtitle="Manage public wellness expert profiles, homepage features, and advisory board content."
      />
      <DashboardExpertsClient />
    </>
  );
}
