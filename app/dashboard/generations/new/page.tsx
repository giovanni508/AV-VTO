import Link from "next/link";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";

import { NewGenerationForm } from "@/components/new-generation-form";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/storage";
import { GARMENT_TYPES, STORAGE_BUCKETS } from "@/lib/config";

// La generazione (Replicate) può richiedere ~1 minuto: alziamo il timeout
// della function. Su Vercel Hobby il massimo è 60s; su Pro fino a 300s.
export const maxDuration = 60;

const TYPE_LABELS = Object.fromEntries(GARMENT_TYPES.map((t) => [t.value, t.label]));

export default async function NewGenerationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS: solo i dati dell'utente corrente.
  const [{ data: models }, { data: generations }] = await Promise.all([
    supabase
      .from("ai_models")
      .select("id, name")
      .order("created_at", { ascending: false }),
    supabase
      .from("generations")
      .select("id, garment_type, generated_image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  const items = await Promise.all(
    (generations ?? []).map(async (g) => ({
      ...g,
      imageUrl: await createSignedUrl(
        supabase,
        STORAGE_BUCKETS.generations,
        g.generated_image_url,
      ),
    })),
  );

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-5xl flex-col">
      {/* Intestazione */}
      <div className="shrink-0">
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
      </div>

      {/* Generazioni (riempiono lo spazio sopra il composer) */}
      <div className="mt-6 flex-1">
        {items.length > 0 ? (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {items.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/dashboard/generations/${g.id}`}
                  className="hover:border-brand-400/60 bg-muted block overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  title={TYPE_LABELS[g.garment_type] ?? g.garment_type}
                >
                  <div className="aspect-[3/4] w-full">
                    {g.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.imageUrl}
                        alt="Shooting generato"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex size-full items-center justify-center">
                        <Clock className="size-4" />
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="bg-muted flex size-14 items-center justify-center rounded-2xl">
              <Sparkles className="text-brand-400 size-6" />
            </div>
            <div>
              <p className="text-foreground font-medium">
                Le tue generazioni appariranno qui
              </p>
              <p className="mt-1 text-sm">
                Allega un capo qui sotto e genera il primo shooting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Composer ancorato in basso */}
      <div className="sticky bottom-6 z-20 mt-6">
        <NewGenerationForm models={models ?? []} userId={user!.id} />
      </div>
    </div>
  );
}
