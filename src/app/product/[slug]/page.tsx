import { notFound, permanentRedirect } from "next/navigation";
import { getProductPageData } from "@/lib/products/page-data";

type LegacyProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export default async function LegacyProductPage({ params }: LegacyProductPageProps) {
  const { slug } = await params;
  const payload = await getProductPageData(slug);

  if (!payload) {
    notFound();
  }

  permanentRedirect(payload.productDetail.path);
}
