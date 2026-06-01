import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardProductsClient } from "@/components/dashboard/products/DashboardProductsClient";

export default function ProductsAdminPage() {
  return (
    <>
      <DashboardHeader
        title="Products"
        subtitle="Manage premium supplement listings, ratings, categories, and affiliate-ready status."
      />
      <DashboardProductsClient />
    </>
  );
}
