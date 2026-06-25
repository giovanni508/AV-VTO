"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

/**
 * Floating card promozionale dell'agenzia "Abbigliamento Vincente".
 * Mostra il logo dell'agenzia su sfondo scuro (il logo è chiaro, quindi
 * risalta). Asset atteso: public/abbigliamento-vincente.png (logo, idealmente
 * PNG trasparente). Se manca, mostra un fallback testuale.
 */
export function AgencyCard() {
  const [imgOk, setImgOk] = useState(true);
  const pathname = usePathname();

  // Nascondila dove darebbe fastidio: landing (hero) e composer (barra in basso).
  if (pathname === "/" || pathname === "/dashboard/generations/new") return null;

  return (
    <a
      href="https://abbigliamentovincente.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scopri l'agenzia Abbigliamento Vincente"
      className="group animate-float fixed right-5 bottom-5 z-50 hidden sm:block"
    >
      <div className="shadow-brand-700/30 relative w-[212px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] p-4 shadow-xl transition-transform duration-300 group-hover:-translate-y-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(20rem_8rem_at_50%_-20%,rgba(47,160,247,0.3),transparent)]" />

        <div className="relative flex flex-col items-center gap-3 text-center">
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/abbigliamento-vincente.png"
              alt="Abbigliamento Vincente"
              onError={() => setImgOk(false)}
              className="h-20 w-auto object-contain"
            />
          ) : (
            <div className="flex flex-col items-center py-1">
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-white/90">A</span>
                <span className="text-gradient">V</span>
              </span>
              <span className="mt-1 text-[10px] tracking-[0.2em] text-white/55 uppercase">
                Abbigliamento Vincente
              </span>
            </div>
          )}

          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors group-hover:bg-white/20">
            Scopri l&apos;agenzia
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
}
