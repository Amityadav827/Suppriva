import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardBlogsClient } from "@/components/dashboard/blogs/DashboardBlogsClient";

export default function BlogsAdminPage() {
  return (
    <>
      <DashboardHeader
        title="Blogs"
        subtitle="Manage editorial guides, SEO articles, and supplement education content."
      />
      <DashboardBlogsClient />
    </>
  );
}
