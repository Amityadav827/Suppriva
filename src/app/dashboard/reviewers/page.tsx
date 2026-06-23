import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ExpertProfilesClient } from "@/components/dashboard/experts/ExpertProfilesClient";

export default function DashboardReviewersPage() {
  return (
    <>
      <DashboardHeader
        title="Reviewers"
        subtitle="Manage medical and expert reviewer profiles used across products, ingredients, and blogs."
      />
      <ExpertProfilesClient kind="reviewer" />
    </>
  );
}
