import Link from "next/link";
import { ImageIcon, Shirt, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    icon: Wand2,
    title: "Try-On con AI",
    text: "Carica un capo e scegli un modello: l'AI genera lo scatto indossato in pochi secondi.",
  },
  {
    icon: Shirt,
    title: "Packshot senza modello",
    text: "Ottieni foto del capo isolato su sfondo pulito, pronte per l'e-commerce.",
  },
  {
    icon: ImageIcon,
    title: "Libreria ordinata",
    text: "Tutti i tuoi shooting e modelli salvati e riutilizzabili, sempre a portata di mano.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="brand-glow flex flex-1 flex-col items-center px-6 py-24">
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
          Carica un capo, scegli un modello e genera shooting professionali senza
          set fotografico. Pensato per i negozi di abbigliamento.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {user ? (
            <Button asChild size="lg" variant="brand">
              <Link href="/dashboard">Vai alla dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" variant="brand">
                <Link href="/signup">Inizia gratis</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Accedi</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }, i) => (
          <div
            key={title}
            className="animate-fade-up bg-card hover:border-brand-400/60 group rounded-xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            style={{ animationDelay: `${i * 80 + 120}ms` }}
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
  );
}
