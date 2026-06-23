import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ExpertProfilesClient } from "@/components/dashboard/experts/ExpertProfilesClient";

export default function DashboardAuthorsPage() {
  return (
    <>
      <DashboardHeader
        title="Authors"
        subtitle="Manage public editorial author profiles used across products, ingredients, and blogs."
      />
      <ExpertProfilesClient kind="author" />
    </>
  );
}
