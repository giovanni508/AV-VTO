import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewGenerationForm } from "@/components/new-generation-form";
import { createClient } from "@/lib/supabase/server";

// La generazione (Replicate) può richiedere ~1 minuto: alziamo il timeout
// della function. Su Vercel Hobby il massimo è 60s; su Pro fino a 300s.
export const maxDuration = 60;

export default async function NewGenerationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS: solo i modelli dell'utente.
  const { data: models } = await supabase
    .from("ai_models")
    .select("id, name")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/generations"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Tutti gli shooting
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Nuovo shooting
        </h1>
        <p className="text-muted-foreground mt-1">
          Scegli un modello, carica un capo e genera l&apos;immagine finale.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dettagli dello shooting</CardTitle>
        </CardHeader>
        <CardContent>
          <NewGenerationForm models={models ?? []} userId={user!.id} />
        </CardContent>
      </Card>
    </div>
  );
}
