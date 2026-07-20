"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock3 } from "lucide-react";

export type BlogPostCard = {
  slug?: string;
  title: string;
  description: string;
  category: string;
  categorySlug?: string;
  readingTime: string;
  image: string;
};

type BlogCardProps = {
  post: BlogPostCard;
  showBadge?: boolean;
};

export function BlogCard({ post, showBadge = true }: BlogCardProps) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-border-light bg-white shadow-[0_18px_52px_rgba(15,23,42,0.07)] transition duration-300 hover:border-gold/70 hover:shadow-premium-hover focus-within:border-gold focus-within:shadow-premium-hover"
    >
      {post.slug ? (
        <Link
          href={`/blog/${post.slug}`}
          aria-label={`Read ${post.title}`}
          className="absolute inset-0 z-20 rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        />
      ) : null}
      <div className="relative h-[230px] overflow-hidden bg-soft-green">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-dark-green/0 transition duration-500 group-hover:bg-dark-green/18" />
        {showBadge ? (
          <Link
            href={post.categorySlug ? `/category/${post.categorySlug}` : "/categories"}
            className="absolute left-5 top-5 z-30 rounded-pill bg-white/92 px-3 py-1.5 font-heading text-xs font-semibold text-primary shadow-[0_12px_28px_rgba(6,57,33,0.14)] backdrop-blur transition hover:bg-primary hover:text-white"
          >
            {post.category}
          </Link>
        ) : null}
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock3 className="size-4 text-gold" aria-hidden="true" />
          <span>{post.readingTime}</span>
        </div>

        <h3 className="mt-4 font-heading text-xl font-extrabold leading-tight text-text-dark">
          {post.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted">
          {post.description}
        </p>

        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <span
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_16px_38px_rgba(11,93,59,0.2)] transition duration-300 group-hover:bg-button-hover group-hover:shadow-premium"
          >
            Read More
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </motion.div>
      </div>
    </motion.article>
  );
}
