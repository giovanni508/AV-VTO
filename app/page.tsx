import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="bg-muted text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
        <Sparkles className="size-3.5" />
        Virtual Try-On con AI
      </div>

      <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        Foto di modelli che indossano i tuoi capi, in pochi secondi
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-balance text-lg">
        Carica un capo, scegli un modello e genera shooting professionali senza
        set fotografico. Pensato per i negozi di abbigliamento.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {user ? (
          <Button asChild size="lg">
            <Link href="/dashboard">Vai alla dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/signup">Inizia gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Accedi</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
