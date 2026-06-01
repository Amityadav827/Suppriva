import { BlogGrid } from "@/components/blog/BlogGrid";
import type { BlogPostCard } from "@/components/blog/BlogCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function SupplementsBlogSection({ posts }: { posts: BlogPostCard[] }) {
  return (
    <SectionWrapper id="blog" tone="white">
      <SectionTitle
        title="Supplements Blog & Guides"
        subtitle="Expert wellness insights, supplement reviews & health guides."
      />
      <BlogGrid posts={posts} />
      <div className="mt-10 flex justify-center">
        <PremiumButton href="/blogs" variant="secondary">
          View All Blogs
        </PremiumButton>
      </div>
    </SectionWrapper>
  );
}
