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
    title: `${payload.product.seo_title || payload.product.title || payload.product.name} Review | Suppriva`,
    description:
      payload.product.seo_description ||
      payload.product.short_description ||
      "Premium Suppriva supplement review.",
    canonicalPath: payload.productDetail.path,
    image: payload.product.image || payload.product.gallery?.[0],
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

  return (
    <>
      <JsonLdScript
        pageType={PageType.Product}
        pageSlug={productSlug}
        schema={[
          buildProductJsonLd(payload.productDetail),
          ...(faqs.length ? [buildFaqJsonLd(faqs)] : []),
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
        ]}
      />
      <Navbar />
      <ProductDetailTemplate product={payload.productDetail} />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
