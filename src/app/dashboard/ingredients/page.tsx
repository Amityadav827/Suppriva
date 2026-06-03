import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardIngredientsClient } from "@/components/dashboard/ingredients/DashboardIngredientsClient";

export default function DashboardIngredientsPage() {
  return (
    <>
      <DashboardHeader
        title="Ingredients"
        subtitle="Manage ingredient authority pages, featured profiles, SEO metadata, and related products."
      />
      <DashboardIngredientsClient />
    </>
  );
}
