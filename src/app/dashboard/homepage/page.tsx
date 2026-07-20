import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardHomepageClient } from "@/components/dashboard/homepage/DashboardHomepageClient";

export default function HomepageAdminPage() {
  return (
    <>
      <DashboardHeader
        title="Homepage CMS"
        subtitle="Manage homepage section visibility, order, headings, subtitles, and CTA defaults."
      />
      <DashboardHomepageClient />
    </>
  );
}
