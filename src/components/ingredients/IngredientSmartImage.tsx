"use client";

import Image from "next/image";
import { FlaskConical } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_INGREDIENT_IMAGE = "/assets/hero-supplements.webp";

type IngredientSmartImageProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
};

export function IngredientSmartImage({
  src,
  alt,
  sizes,
  className,
  fallbackClassName,
  priority = false,
}: IngredientSmartImageProps) {
  const normalizedSrc = src?.trim() || "";
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc || DEFAULT_INGREDIENT_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [showFallbackState, setShowFallbackState] = useState(false);

  useEffect(() => {
    setCurrentSrc(normalizedSrc || DEFAULT_INGREDIENT_IMAGE);
    setIsLoading(true);
    setShowFallbackState(false);
  }, [normalizedSrc]);

  if (showFallbackState) {
    return (
      <div
        className={cn(
          "grid h-full w-full place-items-center bg-gradient-to-br from-soft-green to-gold/[0.14]",
          fallbackClassName,
        )}
      >
        <FlaskConical className="size-20 text-primary" aria-hidden="true" />
      </div>
    );
  }

  return (
    <>
      <Image
        src={currentSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          "object-cover transition duration-700 will-change-transform",
          className,
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (currentSrc !== DEFAULT_INGREDIENT_IMAGE) {
            setCurrentSrc(DEFAULT_INGREDIENT_IMAGE);
            setIsLoading(true);
            return;
          }

          setShowFallbackState(true);
          setIsLoading(false);
        }}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 transition duration-500",
          isLoading
            ? "animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.10)_8%,rgba(255,255,255,0.38)_18%,rgba(255,255,255,0.10)_33%)]"
            : "opacity-0",
        )}
      />
    </>
  );
}
