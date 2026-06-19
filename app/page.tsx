import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ImageIcon,
  Shirt,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";

import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Reveal } from "@/components/marketing/reveal";
import { createClient } from "@/lib/supabase/server";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260618_174853_aac61aa2-0f3f-4cf1-bc78-7f657dd11164.mp4";

const HERO_PILLS = ["Try-on con AI", "Packshot e-commerce", "Pronto in secondi"];

const STEPS = [
  {
    icon: Shirt,
    title: "Carica il capo",
    text: "Foto su manichino, flat lay o già indossata: parti da quello che hai.",
  },
  {
    icon: Wand2,
    title: "Scegli la modalità",
    text: "Con un modello AI oppure packshot su sfondo pulito per l'e-commerce.",
  },
  {
    icon: ImageIcon,
    title: "Ottieni lo scatto",
    text: "Immagine professionale pronta da pubblicare, in pochi secondi.",
  },
];

const FEATURES = [
  {
    icon: UserRound,
    title: "Try-On con modello",
    text: "Il tuo capo indossato da un modello AI fotorealistico, con posa e luce da studio.",
  },
  {
    icon: Shirt,
    title: "Packshot senza modello",
    text: "Il capo isolato su sfondo pulito: lo scatto prodotto standard per ogni scheda.",
  },
  {
    icon: Clock,
    title: "Veloce ed economico",
    text: "Niente set, modelli o fotografo: shooting su richiesta a una frazione del costo.",
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
      {children}
    </span>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = !!user;

  return (
    <main className="font-inter bg-[#070b16] text-white">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative h-dvh w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          src={HERO_VIDEO}
          className="absolute inset-0 size-full object-cover object-[80%_center] md:object-right lg:object-center"
        />
        {/* Scrim morbido solo in basso, per leggibilità (niente overlay pieno) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute inset-0 z-10 flex flex-col px-4 py-4 sm:px-10 sm:py-8 lg:px-12">
          <MarketingNav isAuthed={isAuthed} />

          {/* Spacer su mobile per spingere il contenuto in basso */}
          <div className="flex-1 sm:hidden" />

          <div className="flex flex-col pb-4 sm:mt-auto sm:flex-1 sm:flex-row sm:items-end sm:pb-12 lg:pb-16">
            {/* Colonna sinistra */}
            <div className="flex flex-col gap-4 sm:gap-6">
              <h1 className="font-askan max-w-[760px] text-[2rem] leading-[1.05] tracking-tight text-white sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem]">
                I tuoi capi, indossati da modelli AI.
              </h1>
              <p className="max-w-[520px] text-xs leading-relaxed text-white/70 sm:text-base md:text-lg">
                AV·VTO genera shooting professionali del tuo abbigliamento — con
                modello o packshot su sfondo pulito — in pochi secondi. Pensato
                per i negozi.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={isAuthed ? "/dashboard" : "/signup"}
                  className="brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.03] sm:py-4"
                >
                  {isAuthed ? "Vai alla dashboard" : "Inizia gratis"}
                  <ArrowRight className="size-4" />
                </Link>
                {!isAuthed ? (
                  <Link
                    href="/login"
                    className="rounded-full border border-white/15 bg-black/30 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/40 sm:py-4"
                  >
                    Accedi
                  </Link>
                ) : null}
              </div>

              {/* Feature pills (mobile) */}
              <div className="mt-2 flex flex-wrap gap-2 sm:hidden">
                {HERO_PILLS.map((p) => (
                  <Pill key={p}>{p}</Pill>
                ))}
              </div>
            </div>

            {/* Feature pills (desktop) */}
            <div className="ml-auto hidden flex-col items-end gap-2 self-end sm:flex">
              {HERO_PILLS.map((p) => (
                <Pill key={p}>{p}</Pill>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── COME FUNZIONA ─────────────────── */}
      <section
        id="come-funziona"
        className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-12"
      >
        <div className="pointer-events-none absolute -top-24 right-0 size-[34rem] rounded-full bg-[#2fa0f7]/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <Reveal>
            <p className="text-brand-400 text-sm font-medium tracking-wide uppercase">
              Come funziona
            </p>
            <h2 className="font-askan mt-2 max-w-2xl text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Dallo scatto del capo alla foto finale, in tre passi.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-colors hover:border-white/20">
                  <div className="brand-gradient inline-flex size-11 items-center justify-center rounded-xl text-white shadow-sm">
                    <s.icon className="size-5" />
                  </div>
                  <div className="text-brand-400 mt-4 text-sm font-semibold">
                    0{i + 1}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-white/60">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── FUNZIONALITÀ ─────────────────── */}
      <section
        id="funzionalita"
        className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-12"
      >
        <div className="pointer-events-none absolute -bottom-24 left-0 size-[34rem] rounded-full bg-[#1e3ebe]/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <Reveal>
            <p className="text-brand-400 text-sm font-medium tracking-wide uppercase">
              Funzionalità
            </p>
            <h2 className="font-askan mt-2 max-w-2xl text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Tutto ciò che serve per vendere meglio i tuoi capi.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                  <div className="brand-gradient inline-flex size-11 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-white/60">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── CTA FINALE ─────────────────── */}
      <section className="px-6 pb-24 sm:px-10 lg:px-12">
        <Reveal>
          <div className="brand-gradient relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-8 py-16 text-center shadow-2xl sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_-20%,rgba(255,255,255,0.25),transparent)]" />
            <div className="relative">
              <h2 className="font-askan text-3xl tracking-tight sm:text-4xl md:text-5xl">
                Pronto a fotografare senza set?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/80">
                Crea il tuo account e genera il primo shooting in pochi minuti.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={isAuthed ? "/dashboard" : "/signup"}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-[1.03]"
                >
                  {isAuthed ? "Vai alla dashboard" : "Inizia gratis"}
                  <Sparkles className="size-4" />
                </Link>
                {!isAuthed ? (
                  <Link
                    href="/login"
                    className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Accedi
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer className="border-t border-white/10 px-6 py-8 sm:px-10 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-white/50 sm:flex-row">
          <span className="font-askan text-base tracking-wide text-white">
            AV·VTO
          </span>
          <p>
            © {new Date().getFullYear()} AV·VTO — Virtual Try-On per il tuo
            negozio.
          </p>
        </div>
      </footer>
    </main>
  );
}
