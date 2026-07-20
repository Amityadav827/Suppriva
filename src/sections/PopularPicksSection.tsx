import { ArrowRight } from "lucide-react";
import { ProductSlider } from "@/components/product/ProductSlider";
import type { ProductCardData } from "@/components/product/ProductCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { HomepagePopularPicksSettings } from "@/lib/homepage-popular-picks";
import type { HomepageSectionConfig } from "@/lib/homepage-sections";

export function PopularPicksSection({
  products,
  section,
  settings,
}: {
  products: ProductCardData[];
  section?: HomepageSectionConfig;
  settings?: HomepagePopularPicksSettings;
}) {
  const ctaLabel = section?.cta_label;
  const ctaUrl = section?.cta_url;

  return (
    <SectionWrapper id="best-sellers" tone="white">
      <SectionTitle
        title={section?.title || "Popular Picks & Best Supplements"}
        subtitle={
          section?.subtitle ||
          "A polished starting point for high-intent supplement shoppers."
        }
      />
      <ProductSlider
        products={products}
        showRating={settings?.show_product_rating ?? true}
        showCategory={settings?.show_product_category ?? true}
        showCta={settings?.show_product_cta ?? true}
      />
      {ctaLabel && ctaUrl ? (
        <div className="mt-10 flex justify-center">
          <PremiumButton
            href={ctaUrl}
            variant="secondary"
            icon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            {ctaLabel}
          </PremiumButton>
        </div>
      ) : null}
    </SectionWrapper>
  );
}
