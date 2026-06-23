import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardExpertsClient } from "@/components/dashboard/experts/DashboardExpertsClient";

export default function DashboardAddExpertPage() {
  return (
    <>
      <DashboardHeader
        title="Add Expert"
        subtitle="Create a new public expert profile and connect it to existing author or reviewer attribution."
      />
      <DashboardExpertsClient initialCreateOpen />
    </>
  );
}
