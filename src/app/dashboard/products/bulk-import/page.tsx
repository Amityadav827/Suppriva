import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardProductBulkImportClient } from "@/components/dashboard/products/DashboardProductBulkImportClient";

export default function ProductBulkImportPage() {
  return (
    <>
      <DashboardHeader
        title="Bulk Import"
        subtitle="Upload a structured CSV to create or update products with live category mapping and ingredient relationships."
      />
      <DashboardProductBulkImportClient />
    </>
  );
}
