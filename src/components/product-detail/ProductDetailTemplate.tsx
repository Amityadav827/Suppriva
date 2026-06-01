"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { GridWrapper } from "@/components/layout/GridWrapper";
import { BenefitCard, IngredientCard } from "@/components/product-detail/DetailCards";
import { FAQAccordion } from "@/components/product-detail/FAQAccordion";
import { ProductGallery } from "@/components/product-detail/ProductGallery";
import { ProductInfo } from "@/components/product-detail/ProductInfo";
import { ProsCons } from "@/components/product-detail/ProsCons";
import { RelatedProductsSlider } from "@/components/product-detail/RelatedProductsSlider";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { ProductDetail } from "@/lib/product-data";

export function ProductDetailTemplate({ product }: { product: ProductDetail }) {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-cream pb-[72px] pt-8 md:pb-[92px] lg:pb-[100px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(234,244,236,0.95)_0%,rgba(247,246,242,0)_32%),radial-gradient(circle_at_86%_34%,rgba(217,165,32,0.15)_0%,rgba(247,246,242,0)_28%)]"
        />

        <div className="site-container">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link href="/" className="transition hover:text-primary">
              Home
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <Link href="/categories" className="transition hover:text-primary">
              Supplements
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="font-heading font-semibold text-text-dark">
              {product.name}
            </span>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:gap-14 xl:gap-20">
            <ProductGallery
              productName={product.name}
              images={product.gallery?.length ? product.gallery : product.image ? [product.image] : []}
            />
            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      <SectionWrapper id="benefits">
        <SectionTitle title="Key Benefits" />
        <GridWrapper className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {product.benefits.map((benefit, index) => (
            <BenefitCard
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
              index={index}
            />
          ))}
        </GridWrapper>
      </SectionWrapper>

      <SectionWrapper id="ingredients" tone="white">
        <SectionTitle title="Premium Ingredients" />
        <GridWrapper className="mt-12 grid gap-5 md:grid-cols-2">
          {product.ingredients.map((ingredient, index) => (
            <IngredientCard
              key={ingredient.name}
              name={ingredient.name}
              benefit={ingredient.benefit}
              index={index}
            />
          ))}
        </GridWrapper>
      </SectionWrapper>

      <SectionWrapper id="pros-cons">
        <SectionTitle title="Pros & Cons" />
        <div className="mt-12">
          <ProsCons pros={product.pros} cons={product.cons} />
        </div>
      </SectionWrapper>

      <SectionWrapper id="faq" tone="white">
        <SectionTitle title="Frequently Asked Questions" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="mt-12"
        >
          <FAQAccordion faqs={product.faqs} />
        </motion.div>
      </SectionWrapper>

      <SectionWrapper id="related-products">
        <SectionTitle title="Related Products" />
        <RelatedProductsSlider products={product.relatedProducts} />
      </SectionWrapper>
    </main>
  );
}
