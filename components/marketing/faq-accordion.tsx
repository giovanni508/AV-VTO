"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Devo fare foto professionali del capo?",
    a: "No. Basta una foto chiara del capo: su manichino, stesa (flat lay) o già indossata. Al resto pensa l'AI.",
  },
  {
    q: "Le immagini sono fedeli al capo reale?",
    a: "Sì: colore, stampa, texture e taglio vengono preservati. Puoi anche scegliere il modello più adatto al tuo brand.",
  },
  {
    q: "Posso usare le immagini sul mio e-commerce?",
    a: "Certo. Le immagini sono tue e pronte da pubblicare su sito, social e marketplace.",
  },
  {
    q: "Quanto tempo richiede?",
    a: "Pochi secondi per scatto. Puoi anche generare più variazioni dello stesso capo e scegliere la migliore.",
  },
  {
    q: "Serve un fotografo, un set o un modello?",
    a: "No. Tutto avviene online dal tuo browser: nessun set fotografico, nessun appuntamento, nessun costo di produzione.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/[0.03]"
            >
              <span className="font-medium">{item.q}</span>
              <span className="text-brand-400 shrink-0">
                {isOpen ? (
                  <Minus className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-white/60">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
