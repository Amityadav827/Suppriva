import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar/Navbar";
import { PremiumFooter } from "@/components/footer/PremiumFooter";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { ProductDetailTemplate } from "@/components/product-detail/ProductDetailTemplate";
import { PageType } from "@/lib/database/constants";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { CategoryService } from "@/services/category.service";
import { ProductService } from "@/services/product.service";
import { createCategoryMap, onlyPublished, productToDetail } from "@/lib/live-data";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
} from "@/lib/seo/structured-data";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const productService = new ProductService();

  try {
    const product = await productService.getProductBySlug(slug);
    if (product.status !== "published") {
      throw new Error("Product not published.");
    }

    return {
      ...(await buildSeoMetadata(PageType.Product, slug, {
        title: `${product.seo_title || product.title || product.name} Review | Suppriva`,
        description:
          product.seo_description ||
          product.short_description ||
          "Premium Suppriva supplement review.",
        canonicalPath: `/product/${slug}`,
        image: product.image || product.gallery?.[0],
      })),
    };
  } catch {
    return {
      title: "Product Not Found | Suppriva",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products, categories] = await Promise.all([
    new ProductService().getProductBySlug(slug).catch(() => null),
    new ProductService().getAllProducts(),
    new CategoryService().getAllCategories(),
  ]);

  if (!product || product.status !== "published") {
    notFound();
  }
  const publishedProducts = onlyPublished(products);
  const publishedCategories = onlyPublished(categories);
  const categoryMap = createCategoryMap(publishedCategories);
  const productDetail = productToDetail(product, publishedProducts, categoryMap);

  return (
    <>
      <JsonLdScript
        pageType={PageType.Product}
        pageSlug={slug}
        schema={[
          buildProductJsonLd(productDetail),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: productDetail.name, path: `/product/${slug}` },
          ]),
        ]}
      />
      <Navbar />
      <ProductDetailTemplate product={productDetail} />
      <PremiumFooter />
      <BackToTopButton />
    </>
  );
}
