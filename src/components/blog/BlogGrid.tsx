"use client";

import { motion } from "framer-motion";
import { BlogCard, type BlogPostCard } from "@/components/blog/BlogCard";

export function BlogGrid({ posts }: { posts: BlogPostCard[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6 xl:grid-cols-4"
    >
      {posts.map((post) => (
        <BlogCard key={post.title} post={post} />
      ))}
    </motion.div>
  );
}
