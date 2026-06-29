import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { ProductDetailTemplate } from "@/components/product-detail/ProductDetailTemplate";
import { PageType } from "@/lib/database/constants";
import { getProductPageData } from "@/lib/products/page-data";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildPersonJsonLd,
  buildProductJsonLd,
} from "@/lib/seo/structured-data";

type ProductPageProps = {
  params: Promise<{
    categorySlug: string;
    productSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productSlug } = await params;
  const payload = await getProductPageData(productSlug);

  if (!payload) {
    return {
      title: "Product Not Found | Suppriva",
    };
  }

  return buildSeoMetadata(PageType.Product, productSlug, {
    title:
      payload.productDetail.seo.title ||
      `${payload.product.title || payload.product.name} Review | Suppriva`,
    description:
      payload.productDetail.seo.description ||
      payload.product.short_description ||
      "Premium Suppriva supplement review.",
    canonicalPath: payload.productDetail.seo.canonicalUrl || payload.productDetail.path,
    image: payload.product.image || payload.product.gallery?.[0],
    imageAlt: payload.productDetail.heroImageAlt,
    openGraphTitle: payload.productDetail.seo.ogTitle,
    openGraphDescription: payload.productDetail.seo.ogDescription,
    openGraphImage: payload.productDetail.seo.ogImage,
    twitterTitle: payload.productDetail.seo.twitterTitle,
    twitterDescription: payload.productDetail.seo.twitterDescription,
    twitterImage: payload.productDetail.seo.twitterImage,
    noindex: payload.productDetail.seo.noindex,
    nofollow: payload.productDetail.seo.nofollow,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productSlug, categorySlug } = await params;
  const payload = await getProductPageData(productSlug);

  if (!payload) {
    notFound();
  }

  if (payload.productDetail.categorySlug !== categorySlug) {
    permanentRedirect(payload.productDetail.path);
  }

  const faqs = payload.productDetail.faqs.filter(
    (faq) => faq.question?.trim() && faq.answer?.trim(),
  );
  const customJsonLd = payload.productDetail.schema.customJsonLd;
  const hasCustomJsonLd =
    (Array.isArray(customJsonLd) && customJsonLd.length > 0) ||
    (typeof customJsonLd === "object" &&
      customJsonLd !== null &&
      !Array.isArray(customJsonLd) &&
      Object.keys(customJsonLd).length > 0);
  const schema = [
    ...(payload.productDetail.schema.enableProduct
      ? [buildProductJsonLd(payload.productDetail)]
      : []),
    buildPersonJsonLd(payload.productDetail.expertAttribution.author, "author"),
    buildPersonJsonLd(payload.productDetail.expertAttribution.reviewer, "reviewer"),
    ...(payload.productDetail.schema.enableFaq && faqs.length ? [buildFaqJsonLd(faqs)] : []),
    ...(payload.productDetail.schema.enableBreadcrumb
      ? [
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
            {
              name: payload.productDetail.category,
              path: payload.productDetail.categorySlug
                ? `/category/${payload.productDetail.categorySlug}`
                : "/categories",
            },
            { name: payload.productDetail.name, path: payload.productDetail.path },
          ]),
        ]
      : []),
    ...(payload.productDetail.schema.enableOrganization ? [buildOrganizationJsonLd()] : []),
    ...(hasCustomJsonLd ? [customJsonLd] : []),
  ];

  return (
    <>
      <JsonLdScript
        pageType={PageType.Product}
        pageSlug={productSlug}
        schema={schema}
      />
      <Navbar />
      <ProductDetailTemplate product={payload.productDetail} />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
