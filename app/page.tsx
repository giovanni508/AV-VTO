import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  ImageIcon,
  Shirt,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";

const STEPS = [
  { icon: Shirt, title: "Carica il capo", text: "Foto su manichino, flat lay o indossata." },
  { icon: Wand2, title: "Scegli la modalità", text: "Con modello o packshot su sfondo pulito." },
  { icon: ImageIcon, title: "Ottieni lo scatto", text: "Immagine pronta per il tuo e-commerce." },
];

const FEATURES = [
  {
    icon: UserRound,
    title: "Try-On con AI",
    text: "Carica un capo e scegli un modello: l'AI genera lo scatto indossato in pochi secondi.",
  },
  {
    icon: Shirt,
    title: "Packshot senza modello",
    text: "Ottieni foto del capo isolato su sfondo pulito, pronte per l'e-commerce.",
  },
  {
    icon: Sparkles,
    title: "Qualità da studio",
    text: "Niente set fotografico: shooting professionali a una frazione del costo.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-background/70 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild variant="brand" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Accedi</Link>
                </Button>
                <Button asChild variant="brand" size="sm">
                  <Link href="/signup">Inizia gratis</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-20">
        <section className="animate-fade-up flex max-w-2xl flex-col items-center text-center">
          <div className="bg-background text-brand-700 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm">
            <Sparkles className="size-3.5" />
            Virtual Try-On con AI
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Foto di modelli che indossano{" "}
            <span className="text-brand-700">i tuoi capi</span>, in pochi secondi
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-lg text-balance">
            Carica un capo, scegli un modello e genera shooting professionali
            senza set fotografico. Pensato per i negozi di abbigliamento.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Button asChild size="lg" variant="brand">
                <Link href="/dashboard">
                  Vai alla dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" variant="brand">
                  <Link href="/signup">
                    Inizia gratis
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Accedi</Link>
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Showcase del flusso */}
        <section className="animate-fade-up mt-16 w-full max-w-4xl [animation-delay:120ms]">
          <div className="bg-card/80 shadow-brand grid items-stretch gap-3 rounded-2xl border p-3 backdrop-blur sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {STEPS.map((step, i) => (
              <div key={step.title} className="contents">
                <div className="bg-background flex flex-col items-center gap-2 rounded-xl border p-5 text-center">
                  <div className="brand-gradient inline-flex size-11 items-center justify-center rounded-xl text-white shadow-sm">
                    <step.icon className="size-5" />
                  </div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-muted-foreground text-sm">{step.text}</p>
                </div>
                {i < STEPS.length - 1 ? (
                  <div className="text-brand-400 flex items-center justify-center">
                    <ChevronRight className="size-5 rotate-90 sm:rotate-0" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Feature */}
        <section className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="animate-fade-up bg-card hover:border-brand-400/60 group rounded-xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ animationDelay: `${i * 80 + 200}ms` }}
            >
              <div className="brand-gradient mb-3 inline-flex size-10 items-center justify-center rounded-lg text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mt-10 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm sm:flex-row">
          <Logo size="sm" />
          <p>© {new Date().getFullYear()} AV·VTO — Virtual Try-On per il tuo negozio.</p>
        </div>
      </footer>
    </div>
  );
}
