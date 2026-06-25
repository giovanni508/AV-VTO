import Link from "next/link";
import {
  ArrowRight,
  Check,
  ImageIcon,
  Layers,
  Share2,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  UserRound,
  Wand2,
  X,
} from "lucide-react";

import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Reveal } from "@/components/marketing/reveal";
import { InteractiveCard } from "@/components/marketing/interactive-card";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { createClient } from "@/lib/supabase/server";

const HERO_VIDEO = "/hero.mp4";

const IMG = {
  modelA: "/marketing/model-a.png",
  modelB: "/marketing/model-b.png",
  packshot: "/marketing/packshot.png",
  before: "/marketing/before.png",
  after: "/marketing/after.png",
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

const USE_CASES = [
  {
    icon: ShoppingBag,
    title: "E-commerce",
    text: "Schede prodotto coerenti, con e senza modello, pronte in un attimo.",
  },
  {
    icon: Share2,
    title: "Social & ADV",
    text: "Creatività sempre fresche per post e campagne, senza nuovi shooting.",
  },
  {
    icon: Store,
    title: "Marketplace",
    text: "Immagini professionali e conformi per ogni piattaforma di vendita.",
  },
];

const GALLERY_ROWS = [
  [
    "/marketing/gallery-1.png",
    "/marketing/gallery-2.png",
    "/marketing/model-a.png",
    "/marketing/gallery-3.png",
  ],
  [
    "/marketing/gallery-4.png",
    "/marketing/gallery-5.png",
    "/marketing/model-b.png",
    "/marketing/gallery-6.png",
  ],
];

const TRADITIONAL = [
  "Set, fotografo e modelli da organizzare",
  "Costi e tempi elevati per ogni collezione",
  "Giorni o settimane di attesa",
  "Rigenerare uno scatto significa rifare tutto",
];

const WITH_AVVTO = [
  "Tutto online, direttamente dal tuo browser",
  "Una frazione del costo di un servizio fotografico",
  "Risultati pronti in pochi secondi",
  "Nuovi look e variazioni in un clic",
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

function TileBadge({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-brand-400/20 text-brand-400 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
      {icon}
      {children}
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = !!user;
  const ctaHref = isAuthed ? "/dashboard" : "/signup";
  const ctaLabel = isAuthed ? "Vai alla dashboard" : "Inizia gratis";

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

      {/* ─────────────────── MARQUEE CINETICO ─────────────────── */}
      <section className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-5">
        <div className="animate-marquee flex w-max items-center">
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <span
              key={i}
              className="font-askan mr-10 flex shrink-0 items-center gap-10 text-xl tracking-tight text-white/40"
            >
              {word}
              <span className="bg-brand-400 size-1.5 rounded-full" />
            </span>
          ))}
        </div>
      </section>

      {/* ─────────────────── TRASFORMAZIONE (prima / dopo) ─────────────────── */}
      <section
        id="trasformazione"
        className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-12"
      >
        <div className="pointer-events-none absolute top-0 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-[#2fa0f7]/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1100px]">
          <Reveal className="max-w-2xl">
            <Eyebrow>La trasformazione</Eyebrow>
            <h2 className="font-askan mt-3 text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              Dal capo allo shooting, in un istante.
            </h2>
            <p className="mt-4 text-white/60">
              Carica la foto del capo che hai già: l&apos;AI lo fa indossare a un
              modello, con posa e luce da catalogo. Stesso capo, risultato da
              servizio fotografico.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-10">
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <figure className="relative overflow-hidden rounded-3xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.before}
                  alt="Foto del capo di partenza"
                  className="aspect-[3/4] w-full object-cover"
                />
                <figcaption className="absolute top-4 left-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                  Il capo
                </figcaption>
              </figure>

              <div className="flex items-center justify-center">
                <div className="brand-gradient shadow-brand flex size-12 items-center justify-center rounded-full text-white">
                  <ArrowRight className="size-5 max-sm:rotate-90" />
                </div>
              </div>

              <figure className="relative overflow-hidden rounded-3xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.after}
                  alt="Lo stesso capo indossato da un modello generato"
                  className="aspect-[3/4] w-full object-cover"
                />
                <figcaption className="bg-brand-400/20 text-brand-400 absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md">
                  <Sparkles className="size-3" />
                  Lo shooting
                </figcaption>
                <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                  Generato con AV·VTO
                </div>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── COME FUNZIONA (timeline asimmetrica) ─────────────────── */}
      <section
        id="come-funziona"
        className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-12"
      >
        <div className="pointer-events-none absolute top-0 right-0 size-[36rem] rounded-full bg-[#1e3ebe]/20 blur-3xl" />
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
        <div className="relative mx-auto max-w-[1400px]">
          <Reveal>
            <Eyebrow>Funzionalità</Eyebrow>
            <h2 className="font-askan mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Due modi per fotografare ogni capo.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:auto-rows-[260px] md:grid-cols-12">
            <Reveal className="md:col-span-7 md:row-span-2">
              <InteractiveCard className="group h-full min-h-[460px] overflow-hidden rounded-[1.75rem] border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.modelA}
                  alt="Modella che indossa un capo generato con AV-VTO"
                  className="absolute inset-0 size-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                <div className="relative z-[2] flex h-full flex-col justify-end p-8">
                  <TileBadge icon={<UserRound className="size-3.5" />}>
                    Con modello
                  </TileBadge>
                  <h3 className="font-askan mt-3 max-w-md text-2xl tracking-tight sm:text-3xl">
                    Il tuo capo, indossato da un modello AI
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-white/70">
                    Posa naturale, luce da studio e fedeltà del capo: lo scatto
                    da catalogo, senza shooting.
                  </p>
                </div>
              </InteractiveCard>
            </Reveal>

            <Reveal className="md:col-span-5" delay={80}>
              <InteractiveCard className="group h-full min-h-[260px] overflow-hidden rounded-[1.75rem] border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.packshot}
                  alt="Packshot di un capo su sfondo bianco"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="relative z-[2] flex h-full flex-col justify-end p-6">
                  <TileBadge icon={<Shirt className="size-3.5" />}>
                    Senza modello
                  </TileBadge>
                  <h3 className="font-askan mt-3 text-xl tracking-tight">
                    Packshot su fondo pulito
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    Capo isolato, pronto per la scheda prodotto.
                  </p>
                </div>
              </InteractiveCard>
            </Reveal>

            <Reveal className="md:col-span-5" delay={160}>
              <InteractiveCard className="group h-full min-h-[260px] overflow-hidden rounded-[1.75rem] border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.modelB}
                  alt="Diverse varianti di scatto generate con AV-VTO"
                  className="absolute inset-0 size-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                <div className="relative z-[2] flex h-full flex-col justify-end p-6">
                  <TileBadge icon={<Layers className="size-3.5" />}>
                    Più varianti
                  </TileBadge>
                  <h3 className="font-askan mt-3 text-xl tracking-tight">
                    Più alternative in un clic
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    Genera diverse versioni dello stesso capo e scegli la
                    migliore.
                  </p>
                </div>
              </InteractiveCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────────────── GALLERIA (marquee immagini) ─────────────────── */}
      <section className="overflow-hidden py-24">
        <div className="px-6 sm:px-10 lg:px-12">
          <Reveal className="mx-auto max-w-[1400px]">
            <Eyebrow>Galleria</Eyebrow>
            <h2 className="font-askan mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Scatti generati con AV·VTO.
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 flex flex-col gap-4">
          {GALLERY_ROWS.map((row, idx) => (
            <div
              key={idx}
              className={
                idx === 1
                  ? "animate-marquee flex w-max [animation-direction:reverse]"
                  : "animate-marquee flex w-max"
              }
            >
              {[...row, ...row].map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${idx}-${i}`}
                  src={src}
                  alt="Scatto generato con AV-VTO"
                  className="mr-4 h-72 w-auto shrink-0 rounded-2xl border border-white/10 object-cover"
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── PERFETTO PER (casi d'uso) ─────────────────── */}
      <section className="px-6 py-24 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <Eyebrow>Perfetto per</Eyebrow>
            <h2 className="font-askan mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Un solo strumento, ovunque vendi.
            </h2>
          </Reveal>

          <Reveal delay={100} className="mt-12">
            <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-3">
              {USE_CASES.map((u) => (
                <div key={u.title} className="bg-[#070b16] p-8">
                  <div className="brand-gradient inline-flex size-11 items-center justify-center rounded-xl text-white shadow-sm">
                    <u.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{u.title}</h3>
                  <p className="mt-1.5 text-sm text-white/60">{u.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── PERCHÉ AV·VTO (confronto) ─────────────────── */}
      <section className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-12">
        <div className="pointer-events-none absolute bottom-0 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-[#2fa0f7]/8 blur-3xl" />
        <div className="relative mx-auto max-w-[1100px]">
          <Reveal className="max-w-2xl">
            <Eyebrow>Perché AV·VTO</Eyebrow>
            <h2 className="font-askan mt-3 text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              Lo shooting, senza lo shooting.
            </h2>
          </Reveal>

          <Reveal delay={120} className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-7">
              <h3 className="font-medium text-white/70">Shooting tradizionale</h3>
              <ul className="mt-5 flex flex-col gap-3 text-sm text-white/55">
                {TRADITIONAL.map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
                      <X className="size-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-brand-400/30 bg-brand-400/[0.06] shadow-brand rounded-3xl border p-7">
              <h3 className="font-medium text-white">Con AV·VTO</h3>
              <ul className="mt-5 flex flex-col gap-3 text-sm text-white/80">
                {WITH_AVVTO.map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="bg-brand-400/20 text-brand-400 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-3" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── FAQ ─────────────────── */}
      <section id="faq" className="px-6 py-24 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Eyebrow>Domande</Eyebrow>
            <h2 className="font-askan mt-3 text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Tutto quello che ti serve sapere.
            </h2>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── CTA FINALE ─────────────────── */}
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
                    href={ctaHref}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  >
                    {ctaLabel}
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
      <MarketingFooter />
    </main>
  );
}
