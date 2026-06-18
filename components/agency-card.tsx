"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

/**
 * Floating card promozionale dell'agenzia "Abbigliamento Vincente".
 * Sfondo a gradiente di brand; la foto del ragazzo sborda dal bordo superiore.
 *
 * Asset atteso: public/abbigliamento-vincente.png (preferibilmente un PNG
 * ritagliato/trasparente). Se manca, mostra un monogramma "AV" di fallback.
 */
export function AgencyCard() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <a
      href="https://abbigliamentovincente.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scopri l'agenzia Abbigliamento Vincente"
      className="group animate-float fixed bottom-5 right-5 z-50 hidden sm:block"
    >
      <div className="brand-gradient shadow-brand-700/40 relative w-[212px] overflow-visible rounded-2xl px-4 pt-[4.75rem] pb-4 shadow-xl transition-transform duration-300 group-hover:-translate-y-1">
        {/* Foto: posizionata in modo che la testa sbordi dal bordo superiore. */}
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/abbigliamento-vincente.png"
            alt="Abbigliamento Vincente"
            onError={() => setImgOk(false)}
            className="pointer-events-none absolute -top-12 left-1/2 w-[156px] -translate-x-1/2 select-none drop-shadow-2xl transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="pointer-events-none absolute -top-9 left-1/2 flex size-20 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-lg">
            <span className="text-gradient text-2xl font-extrabold tracking-tight">
              AV
            </span>
          </div>
        )}

        <div className="relative text-white">
          <p className="text-[11px] font-medium tracking-wide text-white/75 uppercase">
            Realizzato da
          </p>
          <p className="text-base leading-tight font-semibold">
            Abbigliamento Vincente
          </p>
          <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm transition-colors group-hover:bg-white/25">
            Scopri l&apos;agenzia
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
}
