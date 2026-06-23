import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { ExpertProfileTemplate } from "@/components/eeat/ExpertProfileTemplate";
import { Navbar } from "@/components/navbar/Navbar";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { getExpertProfilePageData } from "@/lib/eeat/profile-page-data";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildPersonJsonLd,
} from "@/lib/seo/structured-data";
import { PageType } from "@/lib/database/constants";

type ReviewerPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ReviewerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getExpertProfilePageData("reviewer", slug);

  if (!payload) {
    return {
      title: "Reviewer Not Found | Suppriva",
    };
  }

  return buildSeoMetadata(PageType.Static, `reviewer-${slug}`, {
    title: `${payload.profile.name} | Suppriva Reviewer`,
    description:
      payload.profile.bio ||
      `Explore reviewer profile, supplement content, ingredient research, and wellness guides reviewed by ${payload.profile.name}.`,
    canonicalPath: `/reviewer/${payload.profile.slug}`,
    image: payload.profile.photo_url,
    type: "article",
  });
}

export default async function ReviewerPage({ params }: ReviewerPageProps) {
  const { slug } = await params;
  const payload = await getExpertProfilePageData("reviewer", slug);

  if (!payload) {
    notFound();
  }

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug={`reviewer-${slug}`}
        schema={[
          buildPersonJsonLd(payload.profile, "reviewer"),
          buildCollectionPageJsonLd({
            title: payload.profile.name,
            description:
              payload.profile.bio ||
              `Published content reviewed by ${payload.profile.name} on Suppriva.`,
            path: `/reviewer/${payload.profile.slug}`,
            items: [
              ...payload.products.map((product) => ({
                name: product.name,
                path: product.href || `/products/${product.slug}`,
              })),
              ...payload.ingredients.map((ingredient) => ({
                name: ingredient.name,
                path: `/ingredient/${ingredient.slug}`,
              })),
              ...payload.blogs.map((blog) => ({
                name: blog.title,
                path: `/blog/${blog.slug}`,
              })),
            ],
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Reviewer", path: `/reviewer/${payload.profile.slug}` },
            { name: payload.profile.name, path: `/reviewer/${payload.profile.slug}` },
          ]),
        ]}
      />
      <Navbar />
      <ExpertProfileTemplate {...payload} />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}

