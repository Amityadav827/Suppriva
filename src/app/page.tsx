import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { ProductService } from "@/services/product.service";
import {
  blogToCard,
  createCategoryMap,
  onlyPublished,
  productToCard,
} from "@/lib/live-data";
import {
  buildBreadcrumbJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo/structured-data";
import { HeroSection } from "@/sections/HeroSection";
import { AllSupplementCategoriesSection } from "@/sections/AllSupplementCategoriesSection";
import { HealthNeedsSection } from "@/sections/HealthNeedsSection";
import { NewsletterSection } from "@/sections/NewsletterSection";
import { PopularPicksSection } from "@/sections/PopularPicksSection";
import { SupplementsBlogSection } from "@/sections/SupplementsBlogSection";
import { SupplementsBuySellSection } from "@/sections/SupplementsBuySellSection";
import { TrustBadgesStrip } from "@/sections/TrustBadgesStrip";
import { WellnessExpertSection } from "@/sections/WellnessExpertSection";
import { WhyChooseSupprivaSection } from "@/sections/WhyChooseSupprivaSection";

const homeWellnessExpertSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dr. Arindham Chatterjee",
  image:
    "https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg",
  jobTitle: "Medical & Wellness Advisor",
  sameAs: ["https://www.linkedin.com/in/dr-arindham-chatterjee-2b1b6716/"],
};

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Home, "home", {
    title: "Suppriva | Premium Supplement Destination",
    description:
      "Handpicked supplements, vitamins, and wellness products for premium health-focused affiliate recommendations.",
    canonicalPath: "/",
  });
}

export default async function Home() {
  const [products, categories, blogs] = await Promise.all([
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
    new BlogService().getAllBlogs(),
  ]);
  const publishedProducts = onlyPublished(products);
  const publishedCategories = onlyPublished(categories);
  const publishedBlogs = onlyPublished(blogs);
  const categoryMap = createCategoryMap(publishedCategories);
  const productCards = publishedProducts
    .slice(0, 8)
    .map((product, index) => productToCard(product, categoryMap, index));
  const blogCards = publishedBlogs
    .slice(0, 4)
    .map((blog) => blogToCard(blog, categoryMap));
  const categoryPills = publishedCategories.map((category) => ({
    label: category.title,
    slug: category.slug,
  }));

  return (
    <>
      <JsonLdScript
        pageType={PageType.Home}
        pageSlug="home"
        schema={[
          buildWebsiteJsonLd(),
          buildBreadcrumbJsonLd([{ name: "Home", path: "/" }]),
          homeWellnessExpertSchema,
        ]}
      />
      <Navbar />
      <main>
        <HeroSection />
        <HealthNeedsSection categories={categoryPills} />
        <PopularPicksSection products={productCards} />
        <AllSupplementCategoriesSection />
        <WellnessExpertSection />
        <SupplementsBlogSection posts={blogCards} />
        <SupplementsBuySellSection />
        <WhyChooseSupprivaSection />
        <TrustBadgesStrip />
        <NewsletterSection />
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
