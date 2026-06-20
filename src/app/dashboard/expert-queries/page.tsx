import { DashboardExpertQueriesClient } from "@/components/dashboard/expert-queries/DashboardExpertQueriesClient";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function ExpertQueriesAdminPage() {
  return (
    <>
      <DashboardHeader
        title="Expert Queries"
        subtitle="Review pre-purchase supplement questions submitted from product pages."
      />
      <DashboardExpertQueriesClient />
    </>
  );
}
