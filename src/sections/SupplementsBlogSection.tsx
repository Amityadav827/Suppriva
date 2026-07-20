import { BlogGrid } from "@/components/blog/BlogGrid";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

export function SupplementsBlogSection({
  posts,
  section,
  showFeaturedBadge = true,
}: {
  posts: BlogPostCard[];
  section?: HomepageSectionConfig;
  showFeaturedBadge?: boolean;
}) {
  const ctaLabel = section?.cta_label || "View All Blogs";
  const ctaUrl = section?.cta_url || "/blogs";

  return (
    <SectionWrapper id="blog" tone="white">
      <SectionTitle
        title={section?.title || "Supplements Blog & Guides"}
        subtitle={
          section?.subtitle ||
          "Expert wellness insights, supplement reviews & health guides."
        }
      />
      <BlogGrid posts={posts} showBadge={showFeaturedBadge} />
      {ctaLabel && ctaUrl ? (
        <div className="mt-10 flex justify-center">
          <PremiumButton href={ctaUrl} variant="secondary">
            {ctaLabel}
          </PremiumButton>
        </div>
      ) : null}
    </SectionWrapper>
  );
}
