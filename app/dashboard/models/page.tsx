import { createClient } from "@/lib/supabase/server";

export default async function ModelsPage() {
  const supabase = await createClient();
  const { data: models } = await supabase
    .from("ai_models")
    .select("id, name, image_url, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">I tuoi modelli</h1>
        <p className="text-muted-foreground mt-1">
          I modelli AI salvati da riutilizzare negli shooting.
        </p>
      </div>

      {models && models.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {models.map((m) => (
            <li key={m.id} className="rounded-lg border p-3 text-sm">
              {m.name ?? "Senza nome"}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          Nessun modello ancora. La creazione modelli arriva nel prossimo step.
        </div>
      )}
    </div>
  );
}
