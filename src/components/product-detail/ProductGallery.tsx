"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

const galleryAccents = [
  "from-primary/[0.16] to-gold/[0.18]",
  "from-soft-green to-primary/[0.10]",
  "from-gold/[0.16] to-white",
];

export function ProductGallery({
  productName,
  images = [],
}: {
  productName: string;
  images?: string[];
}) {
  const [active, setActive] = useState(0);
  const galleryImages = images.length
    ? images.slice(0, 3)
    : ["/assets/hero-supplements.webp", "/assets/hero-supplements.webp", "/assets/hero-supplements.webp"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="rounded-[32px] border border-border-light bg-white p-5 shadow-premium lg:p-6"
    >
      <div
        className={`group relative flex h-[420px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br ${galleryAccents[active]} sm:h-[520px]`}
      >
        <span
          aria-hidden="true"
          className="absolute size-72 rounded-full bg-gold/18 blur-3xl transition duration-500 group-hover:scale-110"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-[360px] w-[320px] sm:h-[470px] sm:w-[420px]"
        >
          <Image
            src={galleryImages[active] || "/assets/hero-supplements.webp"}
            alt={`${productName} supplement product image`}
            fill
            priority
            sizes="(max-width: 768px) 320px, 420px"
            className="object-contain drop-shadow-[0_34px_42px_rgba(6,57,33,0.24)] transition duration-500 group-hover:scale-105"
          />
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {galleryImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            aria-label={`View ${productName} image ${index + 1}`}
            onClick={() => setActive(index)}
            className={`relative flex h-24 items-center justify-center rounded-2xl border bg-gradient-to-br ${galleryAccents[index % galleryAccents.length]} transition duration-300 ${
              active === index
                ? "border-gold shadow-gold"
                : "border-border-light hover:border-primary/40"
            }`}
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="120px"
              className="object-contain p-2"
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
