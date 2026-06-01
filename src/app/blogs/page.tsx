import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { blogToCard, createCategoryMap, onlyPublished } from "@/lib/live-data";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Static, "blogs", {
    title: "Blogs | Suppriva",
    description: "Browse live Suppriva supplement guides from the database.",
    canonicalPath: "/blogs",
  });
}

export default async function BlogsPage() {
  const [blogs, categories] = await Promise.all([
    new BlogService().getAllBlogs(),
    new CategoryService().getAllCategories(),
  ]);
  const categoryMap = createCategoryMap(onlyPublished(categories));
  const blogCards = onlyPublished(blogs).map((blog) => blogToCard(blog, categoryMap));

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug="blogs"
        schema={[
          buildCollectionPageJsonLd({
            title: "Supplement Guides",
            description: "Live published articles from the Suppriva database.",
            path: "/blogs",
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blogs", path: "/blogs" },
          ]),
        ]}
      />
      <Navbar />
      <main>
        <SectionWrapper id="blogs" tone="white">
          <SectionTitle
            title="Supplement Guides"
            subtitle="Live published articles from the Suppriva database."
          />
          <BlogGrid posts={blogCards} />
        </SectionWrapper>
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
