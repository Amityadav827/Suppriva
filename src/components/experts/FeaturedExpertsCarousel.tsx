"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Expert } from "@/lib/database/types";
import { FeaturedExpertCard } from "@/components/experts/FeaturedExpertCard";

export function FeaturedExpertsCarousel({ experts }: { experts: Expert[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-12 grid gap-6">
        {experts.map((expert) => (
          <FeaturedExpertCard
            key={expert.id}
            expert={expert}
            ctaLabel="Explore Our Experts"
            ctaHref="/experts"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative mt-12">
      <div className="mb-6 flex justify-end gap-3">
        <SliderButton className="experts-prev" label="Previous experts">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </SliderButton>
        <SliderButton className="experts-next" label="Next experts">
          <ChevronRight className="size-5" aria-hidden="true" />
        </SliderButton>
      </div>

      <Swiper
        modules={[Autoplay, Navigation]}
        navigation={{
          prevEl: ".experts-prev",
          nextEl: ".experts-next",
        }}
        autoplay={{
          delay: 4200,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={experts.length > 1}
        speed={700}
        grabCursor
        slidesPerView={1}
        spaceBetween={24}
        className="!overflow-visible"
      >
        {experts.map((expert) => (
          <SwiperSlide key={expert.id} className="!h-auto pb-3">
            <FeaturedExpertCard
              expert={expert}
              ctaLabel="Explore Our Experts"
              ctaHref="/experts"
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
  children: ReactNode;
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
