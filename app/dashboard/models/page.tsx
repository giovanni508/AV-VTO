import { Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddModelForm } from "@/components/add-model-form";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/storage";
import { STORAGE_BUCKETS } from "@/lib/config";
import { deleteModel } from "@/app/dashboard/models/actions";

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
          <AddModelForm userId={user!.id} />
        </CardContent>
      </Card>

      {withThumbs.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {withThumbs.map((m, i) => (
            <li
              key={m.id}
              className="group animate-fade-up hover:border-brand-400/60 relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="bg-muted aspect-[3/4] w-full">
                {m.thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.thumbUrl}
                    alt={m.name ?? "Modello"}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 p-2">
                <span className="truncate text-sm font-medium">
                  {m.name ?? "Senza nome"}
                </span>
                <form action={deleteModel}>
                  <input type="hidden" name="id" value={m.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label="Elimina modello"
                    className="text-muted-foreground hover:text-destructive size-8"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
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
