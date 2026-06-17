import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MediaLibraryClient } from "@/components/dashboard/media/MediaLibraryClient";

export default function MediaLibraryPage() {
  return (
    <>
      <DashboardHeader
        title="Media Library"
        subtitle="Manage Suppriva image assets, SEO metadata, and reusable image URLs for products, categories, blogs, and ingredients."
      />
      <MediaLibraryClient />
    </>
  );
}
