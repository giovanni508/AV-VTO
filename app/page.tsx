import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  ImageIcon,
  Shirt,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";

import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Reveal } from "@/components/marketing/reveal";
import { InteractiveCard } from "@/components/marketing/interactive-card";
import { createClient } from "@/lib/supabase/server";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260618_174853_aac61aa2-0f3f-4cf1-bc78-7f657dd11164.mp4";

const IMG = {
  modelA: "/marketing/model-a.png",
  modelB: "/marketing/model-b.png",
  packshot: "/marketing/packshot.png",
};

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

const MARQUEE = [
  "Virtual Try-On",
  "Packshot e-commerce",
  "Modelli AI",
  "Pronto in secondi",
  "Per i negozi",
  "Qualità da studio",
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-brand-400 text-sm font-medium tracking-wide uppercase">
      {children}
    </p>
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
      <section className="relative min-h-[100dvh] w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          src={HERO_VIDEO}
          className="absolute inset-0 size-full object-cover object-[80%_center] md:object-right lg:object-center"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute inset-0 z-10 flex flex-col px-4 py-4 sm:px-10 sm:py-8 lg:px-12">
          <MarketingNav isAuthed={isAuthed} />

          <div className="flex-1 sm:hidden" />

          <div className="flex flex-col pb-4 sm:mt-auto sm:flex-1 sm:flex-row sm:items-end sm:pb-12 lg:pb-16">
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
                  className="brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98] sm:py-4"
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

              <div className="mt-2 flex flex-wrap gap-2 sm:hidden">
                {HERO_PILLS.map((p) => (
                  <Pill key={p}>{p}</Pill>
                ))}
              </div>
            </div>

            <div className="ml-auto hidden flex-col items-end gap-2 self-end sm:flex">
              {HERO_PILLS.map((p) => (
                <Pill key={p}>{p}</Pill>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── COME FUNZIONA (timeline asimmetrica) ─────────────────── */}
      <section
        id="come-funziona"
        className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-12"
      >
        <div className="pointer-events-none absolute -top-24 right-0 size-[36rem] rounded-full bg-[#2fa0f7]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <Eyebrow>Come funziona</Eyebrow>
            <h2 className="font-askan mt-3 text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              Dallo scatto del capo alla foto finale, in tre passi.
            </h2>
            <p className="mt-4 max-w-md text-white/60">
              Nessun set fotografico, nessun appuntamento. Carichi, scegli,
              scarichi: il resto lo fa l&apos;AI.
            </p>
          </Reveal>

          <div className="relative flex flex-col gap-5">
            <span className="absolute top-4 bottom-4 left-[1.35rem] hidden w-px bg-gradient-to-b from-[#2fa0f7]/60 via-white/15 to-transparent sm:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <div className="flex items-start gap-5">
                  <div className="brand-gradient relative z-[2] flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-sm">
                    0{i + 1}
                  </div>
                  <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-colors hover:border-white/20">
                    <div className="flex items-center gap-2">
                      <s.icon className="text-brand-400 size-4" />
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm text-white/60">{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── FUNZIONALITÀ (bento + immagini) ─────────────────── */}
      <section
        id="funzionalita"
        className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-12"
      >
        <div className="pointer-events-none absolute -bottom-24 left-0 size-[36rem] rounded-full bg-[#1e3ebe]/20 blur-3xl" />
        <div className="relative mx-auto max-w-[1400px]">
          <Reveal>
            <Eyebrow>Funzionalità</Eyebrow>
            <h2 className="font-askan mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Due modi per fotografare ogni capo.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-3 md:auto-rows-[220px]">
            {/* Tile grande: try-on con modello */}
            <Reveal className="md:col-span-2 md:row-span-2">
              <InteractiveCard className="h-full min-h-[440px] overflow-hidden rounded-3xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.modelA}
                  alt="Modella che indossa un capo generato con AV-VTO"
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="relative z-[2] flex h-full flex-col justify-end p-8">
                  <div className="bg-brand-400/20 text-brand-400 mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    <UserRound className="size-3.5" />
                    Con modello
                  </div>
                  <h3 className="font-askan max-w-md text-2xl tracking-tight sm:text-3xl">
                    Il tuo capo, indossato da un modello AI
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-white/70">
                    Posa naturale, luce da studio e fedeltà del capo: lo scatto
                    da catalogo senza shooting.
                  </p>
                </div>
              </InteractiveCard>
            </Reveal>

            {/* Tile: packshot */}
            <Reveal delay={80}>
              <InteractiveCard className="h-full min-h-[220px] overflow-hidden rounded-3xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.packshot}
                  alt="Packshot di un capo su sfondo bianco"
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="relative z-[2] flex h-full flex-col justify-end p-6">
                  <h3 className="font-askan text-xl tracking-tight">
                    Packshot senza modello
                  </h3>
                  <p className="mt-1 text-xs text-white/70">
                    Capo isolato su fondo pulito, pronto per la scheda prodotto.
                  </p>
                </div>
              </InteractiveCard>
            </Reveal>

            {/* Tile: dato reale */}
            <Reveal delay={160}>
              <div className="flex h-full min-h-[220px] flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-md">
                <div className="brand-gradient inline-flex size-11 items-center justify-center rounded-xl text-white shadow-sm">
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-3xl font-semibold tracking-tight">
                    da 4 crediti
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    a scatto. Niente set, niente fotografo, nessuna attesa.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────────────── MARQUEE CINETICO ─────────────────── */}
      <section className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-5">
        <div className="animate-marquee flex w-max items-center gap-10 pr-10">
          {[0, 1].map((track) => (
            <div key={track} className="flex shrink-0 items-center gap-10">
              {MARQUEE.map((word) => (
                <span
                  key={word}
                  className="font-askan flex items-center gap-10 text-xl tracking-tight text-white/40"
                >
                  {word}
                  <span className="bg-brand-400 size-1.5 rounded-full" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── SHOWCASE (asimmetrico + tilt) ─────────────────── */}
      <section className="px-6 py-24 sm:px-10 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>Dal capo allo scatto</Eyebrow>
            <h2 className="font-askan mt-3 text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              Senza set, senza fotografo, senza attese.
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                "Carichi una foto del capo che hai già",
                "Scegli: con modello AI o packshot pulito",
                "Scarichi l'immagine pronta per l'e-commerce",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-white/80">
                  <span className="bg-brand-400/15 text-brand-400 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href={isAuthed ? "/dashboard" : "/signup"}
              className="brand-gradient mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              {isAuthed ? "Vai alla dashboard" : "Inizia gratis"}
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <InteractiveCard className="overflow-hidden rounded-3xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMG.modelB}
                alt="Scatto editoriale generato con AV-VTO"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 z-[2] rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/90 backdrop-blur-md">
                Generato con AV·VTO
              </div>
            </InteractiveCard>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── CTA (bordo conico animato) ─────────────────── */}
      <section className="px-6 pb-24 sm:px-10 lg:px-12">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] p-px">
            <div className="absolute -inset-40 animate-[spin_9s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,#2fa0f7_70deg,#1e3ebe_140deg,transparent_220deg)]" />
            <div className="relative overflow-hidden rounded-[calc(1.75rem-1px)] bg-[#0b1020] px-8 py-16 text-center sm:px-12">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(42rem_18rem_at_50%_-10%,rgba(47,160,247,0.18),transparent)]" />
              <div className="relative">
                <h2 className="font-askan text-3xl tracking-tight sm:text-4xl md:text-5xl">
                  Pronto a fotografare senza set?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/70">
                  Crea il tuo account e genera il primo shooting in pochi minuti.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={isAuthed ? "/dashboard" : "/signup"}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  >
                    {isAuthed ? "Vai alla dashboard" : "Inizia gratis"}
                    <Sparkles className="size-4" />
                  </Link>
                  {!isAuthed ? (
                    <Link
                      href="/login"
                      className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      Accedi
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer className="border-t border-white/10 px-6 py-8 sm:px-10 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 text-sm text-white/50 sm:flex-row">
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
