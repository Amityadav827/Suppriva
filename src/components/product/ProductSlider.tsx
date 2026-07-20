"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";

export function ProductSlider({
  products,
  showRating = true,
  showCategory = true,
  showCta = true,
}: {
  products: ProductCardData[];
  showRating?: boolean;
  showCategory?: boolean;
  showCta?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const sliderProducts = products.length > 1 ? [...products, ...products] : products;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-12 grid gap-6 md:mt-14 md:grid-cols-3 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard
            key={product.name}
            product={product}
            showRating={showRating}
            showCategory={showCategory}
            showCta={showCta}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative mt-12 md:mt-14">
      <div className="mb-6 flex justify-end gap-3">
        <SliderButton className="popular-picks-prev" label="Previous products">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </SliderButton>
        <SliderButton className="popular-picks-next" label="Next products">
          <ChevronRight className="size-5" aria-hidden="true" />
        </SliderButton>
      </div>

      <Swiper
        modules={[Autoplay, Navigation]}
        navigation={{
          prevEl: ".popular-picks-prev",
          nextEl: ".popular-picks-next",
        }}
        autoplay={{
          delay: 3600,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={products.length > 3}
        speed={650}
        grabCursor
        slidesPerView={1.2}
        spaceBetween={18}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 22,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 24,
          },
        }}
        className="!overflow-visible"
      >
        {sliderProducts.map((product, index) => (
          <SwiperSlide key={`${product.name}-${index}`} className="!h-auto pb-3">
            <ProductCard
              product={product}
              showRating={showRating}
              showCategory={showCategory}
              showCta={showCta}
            />
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
