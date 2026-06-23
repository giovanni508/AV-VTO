import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Mail } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Contatti — AV·VTO",
  description: "Parla con il team di AV·VTO per il tuo catalogo.",
};

export default function ContattiPage() {
  return (
    <main className="relative overflow-hidden px-6 py-20 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute top-0 right-0 size-[40rem] rounded-full bg-[#1e3ebe]/20 blur-3xl" />
      <div className="relative mx-auto max-w-3xl">
        <Reveal>
          <p className="text-brand-400 text-sm font-medium tracking-wide uppercase">
            Contatti
          </p>
          <h1 className="font-askan mt-3 text-4xl tracking-tight sm:text-5xl">
            Parliamo del tuo catalogo.
          </h1>
          <p className="mt-4 max-w-xl text-white/60">
            Hai un negozio o un brand di abbigliamento e vuoi capire come AV·VTO
            può aiutarti a fotografare i capi senza set? Scrivici: ti rispondiamo
            volentieri.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12 grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:info@abbigliamentovincente.com"
            className="hover:border-brand-400/50 group flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-colors"
          >
            <div className="brand-gradient inline-flex size-11 items-center justify-center rounded-xl text-white shadow-sm">
              <Mail className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Email</h2>
              <p className="mt-1 text-sm text-white/55">
                info@abbigliamentovincente.com
              </p>
            </div>
          </a>

          <a
            href="https://abbigliamentovincente.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:border-brand-400/50 group flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-colors"
          >
            <div className="brand-gradient inline-flex size-11 items-center justify-center rounded-xl text-white shadow-sm">
              <ExternalLink className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">L&apos;agenzia</h2>
              <p className="mt-1 text-sm text-white/55">
                abbigliamentovincente.com
              </p>
            </div>
          </a>
        </Reveal>

        <Reveal delay={200} className="mt-10">
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-askan text-2xl tracking-tight">
                Oppure provalo subito.
              </h2>
              <p className="mt-1 text-sm text-white/55">
                Crei l&apos;account in un minuto e generi il primo shooting.
              </p>
            </div>
            <Link
              href="/signup"
              className="brand-gradient inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Inizia gratis
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
