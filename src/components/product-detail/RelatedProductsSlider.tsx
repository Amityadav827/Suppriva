"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";

export function RelatedProductsSlider({
  products: liveProducts,
}: {
  products?: ProductCardData[];
}) {
  const [mounted, setMounted] = useState(false);
  const products = useMemo(() => liveProducts ?? [], [liveProducts]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative mt-12 min-w-0">
      <div className="mb-6 flex justify-end gap-3">
        <SliderButton className="related-products-prev" label="Previous products">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </SliderButton>
        <SliderButton className="related-products-next" label="Next products">
          <ChevronRight className="size-5" aria-hidden="true" />
        </SliderButton>
      </div>

      <div className="min-w-0 overflow-hidden">
        <Swiper
          modules={[Autoplay, Navigation]}
          navigation={{
            prevEl: ".related-products-prev",
            nextEl: ".related-products-next",
          }}
          autoplay={{
            delay: 3800,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={products.length > 4}
          watchOverflow
          speed={650}
          grabCursor
          slidesPerView={1}
          spaceBetween={18}
          breakpoints={{
            640: { slidesPerView: 1.2, spaceBetween: 18 },
            768: { slidesPerView: 2, spaceBetween: 22 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="w-full !overflow-hidden !pb-3"
        >
          {products.map((product) => (
            <SwiperSlide key={product.href || product.slug || product.name} className="!h-auto">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

function SliderButton({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${className} grid size-12 place-items-center rounded-full border border-border-light bg-white text-primary shadow-[0_14px_38px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-gold/70 hover:bg-primary hover:text-white hover:shadow-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold`}
    >
      {children}
    </button>
  );
}
