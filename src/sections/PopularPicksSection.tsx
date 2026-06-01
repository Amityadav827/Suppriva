import { ProductSlider } from "@/components/product/ProductSlider";
import type { ProductCardData } from "@/components/product/ProductCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function PopularPicksSection({ products }: { products: ProductCardData[] }) {
  return (
    <SectionWrapper id="best-sellers" tone="white">
      <SectionTitle
        title="Popular Picks & Best Supplements"
        subtitle="A polished starting point for high-intent supplement shoppers."
      />
      <ProductSlider products={products} />
    </SectionWrapper>
  );
}
