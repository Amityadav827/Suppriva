import { DashboardCategoriesClient } from "@/components/dashboard/categories/DashboardCategoriesClient";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function CategoriesAdminPage() {
  return (
    <>
      <DashboardHeader
        title="Categories"
        subtitle="Organize health needs, supplement categories, and SEO discovery groups."
      />
      <DashboardCategoriesClient />
    </>
  );
}
