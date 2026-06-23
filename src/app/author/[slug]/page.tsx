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

type AuthorPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getExpertProfilePageData("author", slug);

  if (!payload) {
    return {
      title: "Author Not Found | Suppriva",
    };
  }

  return buildSeoMetadata(PageType.Static, `author-${slug}`, {
    title: `${payload.profile.name} | Suppriva Author`,
    description:
      payload.profile.bio ||
      `Explore author profile, supplement content, ingredient research, and wellness guides by ${payload.profile.name}.`,
    canonicalPath: `/author/${payload.profile.slug}`,
    image: payload.profile.photo_url,
    type: "article",
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const payload = await getExpertProfilePageData("author", slug);

  if (!payload) {
    notFound();
  }

  return (
    <>
      <JsonLdScript
        pageType={PageType.Static}
        pageSlug={`author-${slug}`}
        schema={[
          buildPersonJsonLd(payload.profile, "author"),
          buildCollectionPageJsonLd({
            title: payload.profile.name,
            description:
              payload.profile.bio ||
              `Published content by ${payload.profile.name} on Suppriva.`,
            path: `/author/${payload.profile.slug}`,
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
            { name: "Author", path: `/author/${payload.profile.slug}` },
            { name: payload.profile.name, path: `/author/${payload.profile.slug}` },
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

