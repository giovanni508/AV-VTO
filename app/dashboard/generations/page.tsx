import { createClient } from "@/lib/supabase/server";

export default async function GenerationsPage() {
  const supabase = await createClient();
  const { data: generations } = await supabase
    .from("generations")
    .select("id, garment_type, generated_image_url, cost_in_credits, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">I tuoi shooting</h1>
        <p className="text-muted-foreground mt-1">
          Lo storico delle immagini generate con il Virtual Try-On.
        </p>
      </div>

      {generations && generations.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {generations.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between rounded-lg border p-3 text-sm"
            >
              <span className="capitalize">{g.garment_type}</span>
              <span className="text-muted-foreground">
                {g.cost_in_credits} crediti
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          Ancora nessuno shooting. Il motore di generazione arriva nel prossimo
          step.
        </div>
      )}
    </div>
  );
}
