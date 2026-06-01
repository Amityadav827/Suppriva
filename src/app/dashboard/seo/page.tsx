import { DashboardSeoClient } from "@/components/dashboard/seo/DashboardSeoClient";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function SeoAdminPage() {
  return (
    <>
      <DashboardHeader
        title="SEO"
        subtitle="Future-ready controls for search visibility, metadata, sitemap, and robots settings."
      />
      <DashboardSeoClient />
    </>
  );
}
