import { Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddModelPanel } from "@/components/add-model-panel";
import { EmptyState } from "@/components/empty-state";
import { ModelCard } from "@/components/model-card";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/storage";
import { STORAGE_BUCKETS } from "@/lib/config";

// La generazione del modello chiama Replicate: alziamo il timeout della function.
export const maxDuration = 60;

export default async function ModelsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS: solo i modelli dell'utente corrente.
  const { data: models } = await supabase
    .from("ai_models")
    .select("id, name, image_url, created_at")
    .order("created_at", { ascending: false });

  const withThumbs = await Promise.all(
    (models ?? []).map(async (m) => ({
      ...m,
      thumbUrl: await createSignedUrl(
        supabase,
        STORAGE_BUCKETS.models,
        m.image_url,
      ),
    })),
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">I tuoi modelli</h1>
        <p className="text-muted-foreground mt-1">
          Carica le foto dei modelli da riutilizzare negli shooting Virtual
          Try-On.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aggiungi un modello</CardTitle>
        </CardHeader>
        <CardContent>
          <AddModelPanel userId={user!.id} />
        </CardContent>
      </Card>

      {withThumbs.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {withThumbs.map((m, i) => (
            <li
              key={m.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <ModelCard id={m.id} name={m.name} imageUrl={m.thumbUrl} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Users className="size-6" />}
          title="Nessun modello ancora"
          description="Aggiungi qui sopra la foto di un modello per iniziare a generare shooting con modello."
        />
      )}
    </div>
  );
}
