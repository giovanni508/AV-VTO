"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Immagine con skeleton: shimmer finché il file non è scaricato, poi fade-in.
 * Evita il "pop" bianco delle immagini firmate di Supabase (mai in cache).
 */
export function SmoothImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={cn("relative block overflow-hidden", className)}>
      {!loaded ? <span className="skeleton absolute inset-0" aria-hidden /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          "size-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}
