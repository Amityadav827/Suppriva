import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { BlogService } from "@/services/blog.service";
import { CategoryService } from "@/services/category.service";
import { ExpertsService } from "@/services/experts.service";
import { HomepageHeroService } from "@/services/homepage-hero.service";
import { HomepageIngredientsDiscoveryService } from "@/services/homepage-ingredients-discovery.service";
import { HomepageSectionsService } from "@/services/homepage-sections.service";
import { HomepageWellnessExpertService } from "@/services/homepage-wellness-expert.service";
import { ProductService } from "@/services/product.service";
import {
  blogToCard,
  createCategoryMap,
  onlyPublished,
  productToCard,
} from "@/lib/live-data";
import {
  buildBreadcrumbJsonLd,
  buildPublicPersonJsonLd,
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(PageType.Home, "home", {
    title: "Suppriva | Premium Supplement Destination",
    description:
      "Handpicked supplements, vitamins, and wellness products for premium health-focused affiliate recommendations.",
    canonicalPath: "/",
  });
}

export default async function Home() {
  const [
    products,
    categories,
    blogs,
    featuredExperts,
    activeExperts,
    homepageSections,
    homepageHero,
    homepageIngredientsDiscovery,
    homepageWellnessExpert,
  ] = await Promise.all([
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
    new BlogService().getAllBlogs(),
    new ExpertsService().safeGetFeaturedExperts(),
    new ExpertsService().safeGetActiveExperts(),
    new HomepageSectionsService().safeGetHomepageSections(),
    new HomepageHeroService().safeGetHomepageHero(),
    new HomepageIngredientsDiscoveryService().safeGetHomepageIngredientsDiscovery(),
    new HomepageWellnessExpertService().safeGetHomepageWellnessExpert(),
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
  const homepageExpert = featuredExperts[0] || activeExperts[0] || null;
  const visibleHomepageSections = homepageSections.filter((section) => section.is_visible);

  function renderHomepageSection(section: (typeof homepageSections)[number]) {
    switch (section.section_key) {
      case "hero":
        return (
          <HeroSection
            key={section.section_key}
            section={section}
            hero={homepageHero}
          />
        );
      case "health_needs":
        return (
          <HealthNeedsSection
            key={section.section_key}
            categories={categoryPills}
            section={section}
          />
        );
      case "popular_picks":
        return (
          <PopularPicksSection
            key={section.section_key}
            products={productCards}
            section={section}
          />
        );
      case "ingredients_discovery":
        return (
          <AllSupplementCategoriesSection
            key={section.section_key}
            section={section}
            chips={homepageIngredientsDiscovery.chips}
          />
        );
      case "wellness_expert":
        return (
          <WellnessExpertSection
            key={section.section_key}
            expert={homepageExpert}
            section={section}
            cms={homepageWellnessExpert}
          />
        );
      case "blogs":
        return (
          <SupplementsBlogSection
            key={section.section_key}
            posts={blogCards}
            section={section}
          />
        );
      case "discover_wellness_solutions":
        return (
          <SupplementsBuySellSection key={section.section_key} section={section} />
        );
      case "why_choose_suppriva":
        return (
          <WhyChooseSupprivaSection key={section.section_key} section={section} />
        );
      case "trust_badges":
        return <TrustBadgesStrip key={section.section_key} section={section} />;
      case "newsletter":
        return <NewsletterSection key={section.section_key} section={section} />;
      default:
        return null;
    }
  }

  return (
    <>
      <JsonLdScript
        pageType={PageType.Home}
        pageSlug="home"
        schema={[
          buildWebsiteJsonLd(),
          buildBreadcrumbJsonLd([{ name: "Home", path: "/" }]),
          ...(homepageExpert
            ? [
                buildPublicPersonJsonLd({
                  name: homepageExpert.name,
                  path: `/experts/${homepageExpert.slug}`,
                  image: homepageExpert.profile_image,
                  jobTitle: homepageExpert.designation,
                  description: homepageExpert.short_bio,
                  sameAs: [homepageExpert.linkedin_url, homepageExpert.website_url].filter(
                    (value): value is string => Boolean(value),
                  ),
                }),
              ]
            : []),
        ]}
      />
      <Navbar />
      <main>
        {visibleHomepageSections.map((section) => renderHomepageSection(section))}
      </main>
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
