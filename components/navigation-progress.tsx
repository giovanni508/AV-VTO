"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Barra di avanzamento globale in cima alla pagina: parte al click su un link
 * interno e si completa quando la nuova rotta è pronta. Dà il feedback
 * immediato "sta caricando" che mancava sui cambi pagina.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Avvio al click su un link interno.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || !href.startsWith("/") || anchor.target === "_blank") {
        return;
      }
      if (
        href === window.location.pathname + window.location.search ||
        href === window.location.pathname
      ) {
        return;
      }

      if (tick.current) clearInterval(tick.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
      setProgress(12);
      // Avanza fino a ~90% mentre la rotta si carica.
      tick.current = setInterval(() => {
        setProgress((p) => (p < 90 ? p + (90 - p) * 0.12 : p));
      }, 200);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Completamento al cambio rotta. Deferito con setTimeout: così non è un
  // setState sincrono nel corpo dell'effect (niente render a cascata).
  useEffect(() => {
    const id = setTimeout(() => {
      if (tick.current) clearInterval(tick.current);
      tick.current = null;
      setProgress(100);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 280);
    }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  // Pulizia dei timer allo smontaggio.
  useEffect(() => {
    return () => {
      if (tick.current) clearInterval(tick.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
    >
      <div
        className="brand-gradient h-full origin-left shadow-[0_0_12px_rgba(47,160,247,0.7)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
