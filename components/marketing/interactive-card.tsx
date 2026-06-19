"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Card interattiva con tilt 3D + spotlight che segue il cursore.
 * Le coordinate sono scritte come CSS variables DIRETTAMENTE sull'elemento
 * (via ref, niente useState) per non innescare re-render: 60fps anche su mobile.
 * Lo spotlight è renderizzato dalla classe `.spotlight-card` in globals.css.
 */
export function InteractiveCard({
  children,
  className,
  tilt = true,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    if (tilt) {
      el.style.setProperty("--rx", `${(0.5 - py) * 7}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * 7}deg`);
    }
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "spotlight-card relative transition-transform duration-300 ease-out will-change-transform motion-reduce:transform-none",
        className,
      )}
      style={{
        transform:
          "perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
      }}
    >
      {children}
    </div>
  );
}
