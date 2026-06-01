"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { CategoryProductCard } from "@/components/category-page/CategoryProductCard";
import type { CategoryProduct } from "@/lib/category-data";

export function FeaturedProductsSlider({
  products,
}: {
  products: CategoryProduct[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <CategoryProductCard key={product.name} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative mt-12">
      <div className="mb-6 flex justify-end gap-3">
        <SliderButton className="featured-category-prev" label="Previous products">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </SliderButton>
        <SliderButton className="featured-category-next" label="Next products">
          <ChevronRight className="size-5" aria-hidden="true" />
        </SliderButton>
      </div>
      <Swiper
        modules={[Autoplay, Navigation]}
        navigation={{
          prevEl: ".featured-category-prev",
          nextEl: ".featured-category-next",
        }}
        autoplay={{
          delay: 3800,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop
        speed={650}
        grabCursor
        slidesPerView={1.12}
        spaceBetween={18}
        breakpoints={{
          768: { slidesPerView: 2, spaceBetween: 22 },
          1280: { slidesPerView: 4, spaceBetween: 24 },
        }}
        className="!overflow-visible"
      >
        {[...products, ...products].map((product, index) => (
          <SwiperSlide key={`${product.name}-${index}`} className="!h-auto pb-3">
            <CategoryProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
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
