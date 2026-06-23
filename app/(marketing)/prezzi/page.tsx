import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prezzi — AV·VTO",
  description:
    "Pacchetti di crediti per generare shooting Virtual Try-On. Paghi solo i crediti che usi.",
};

const PLANS = [
  {
    name: "Starter",
    price: "19",
    credits: "190 crediti",
    tagline: "Per iniziare e provare sul tuo catalogo.",
    features: [
      "Try-on con modello",
      "Packshot senza modello",
      "Immagini in alta risoluzione",
      "Storico degli shooting",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "49",
    credits: "600 crediti",
    tagline: "Per negozi che aggiornano spesso le schede.",
    features: [
      "Tutto di Starter",
      "Modelli AI generati su misura",
      "Più variazioni per capo",
      "Modelli salvati e riutilizzabili",
    ],
    popular: true,
  },
  {
    name: "Studio",
    price: "99",
    credits: "1.500 crediti",
    tagline: "Per cataloghi ampi e collezioni intere.",
    features: [
      "Tutto di Pro",
      "Volume elevato di shooting",
      "Priorità di generazione",
      "Supporto dedicato",
    ],
    popular: false,
  },
];

export default function PrezziPage() {
  return (
    <main className="relative overflow-hidden px-6 py-20 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute top-0 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-[#2fa0f7]/10 blur-3xl" />
      <div className="relative mx-auto max-w-[1100px]">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-brand-400 text-sm font-medium tracking-wide uppercase">
            Prezzi
          </p>
          <h1 className="font-askan mt-3 text-4xl tracking-tight sm:text-5xl">
            Paghi solo i crediti che usi.
          </h1>
          <p className="mt-4 text-white/60">
            Niente abbonamenti obbligatori. Acquisti un pacchetto di crediti e li
            spendi quando generi. Ogni shooting con modello costa 10 crediti, un
            packshot 4, un modello AI 40.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-14">
          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-7",
                  plan.popular
                    ? "border-brand-400/40 bg-brand-400/[0.06] shadow-brand"
                    : "border-white/10 bg-white/[0.02]",
                )}
              >
                {plan.popular ? (
                  <span className="brand-gradient absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow">
                    <Sparkles className="size-3" />
                    Più scelto
                  </span>
                ) : null}

                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="text-muted-foreground mt-1 text-sm text-white/55">
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-end gap-1">
                  <span className="font-askan text-4xl tracking-tight">
                    €{plan.price}
                  </span>
                  <span className="mb-1 text-sm text-white/50">una tantum</span>
                </div>
                <p className="text-brand-400 mt-1 text-sm font-medium">
                  {plan.credits}
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-white/75">
                      <span className="bg-brand-400/15 text-brand-400 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                        <Check className="size-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={cn(
                    "mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]",
                    plan.popular
                      ? "brand-gradient text-white shadow-lg"
                      : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                  )}
                >
                  Inizia gratis
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </Reveal>

        <p className="text-muted-foreground mt-10 text-center text-sm text-white/40">
          Crei l&apos;account gratis e provi subito. I pacchetti si attivano
          quando vuoi.
        </p>
      </div>
    </main>
  );
}
