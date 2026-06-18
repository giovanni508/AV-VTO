"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Numero che si anima da 0 al valore (easeOutCubic), con rispetto del
 * prefers-reduced-motion. Usato per le statistiche della dashboard.
 */
export function CountUp({
  value,
  duration = 900,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const total = Math.max(reduce ? 1 : duration, 1);
    const start = performance.now();

    function frame(now: number) {
      const t = Math.min((now - start) / total, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf.current = requestAnimationFrame(frame);
    }

    raf.current = requestAnimationFrame(frame);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return (
    <span className={className} suppressHydrationWarning>
      {display.toLocaleString("it-IT")}
    </span>
  );
}
