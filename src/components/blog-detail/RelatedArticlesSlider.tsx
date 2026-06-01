"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { BlogPostCard } from "@/components/blog/BlogCard";

type RelatedArticle = BlogPostCard & { slug: string };

export function RelatedArticlesSlider({ articles }: { articles: RelatedArticle[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {articles.map((article) => (
          <RelatedArticleCard key={article.slug} article={article} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative mt-12">
      <div className="mb-6 flex justify-end gap-3">
        <SliderButton className="related-articles-prev" label="Previous articles">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </SliderButton>
        <SliderButton className="related-articles-next" label="Next articles">
          <ChevronRight className="size-5" aria-hidden="true" />
        </SliderButton>
      </div>
      <Swiper
        modules={[Autoplay, Navigation]}
        navigation={{
          prevEl: ".related-articles-prev",
          nextEl: ".related-articles-next",
        }}
        autoplay={{
          delay: 4200,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={articles.length > 2}
        speed={650}
        grabCursor
        slidesPerView={1.12}
        spaceBetween={18}
        breakpoints={{
          768: { slidesPerView: 2, spaceBetween: 22 },
          1280: { slidesPerView: 3, spaceBetween: 24 },
        }}
        className="!overflow-visible"
      >
        {[...articles, ...articles].map((article, index) => (
          <SwiperSlide key={`${article.slug}-${index}`} className="!h-auto pb-3">
            <RelatedArticleCard article={article} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function RelatedArticleCard({
  article,
}: {
  article: RelatedArticle;
}) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35 }}
      className="group h-full overflow-hidden rounded-[28px] border border-border-light bg-white shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium-hover"
    >
      <div className="relative h-56 overflow-hidden bg-soft-green">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-6">
        <span className="rounded-pill bg-soft-green px-3 py-1.5 font-heading text-xs font-semibold text-primary">
          {article.category}
        </span>
        <h3 className="mt-4 font-heading text-xl font-extrabold leading-tight text-text-dark">
          {article.title}
        </h3>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Clock3 className="size-4 text-gold" aria-hidden="true" />
          {article.readingTime}
        </p>
        <Link
          href={`/blog/${article.slug}`}
          className="mt-5 inline-flex rounded-pill bg-primary px-5 py-3 font-heading text-sm font-semibold text-white transition duration-300 hover:bg-button-hover"
        >
          Read More
        </Link>
      </div>
    </motion.article>
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
