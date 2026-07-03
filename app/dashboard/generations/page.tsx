import Link from "next/link";
import { Clock, ImageIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { SmoothImage } from "@/components/smooth-image";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/storage";
import { GARMENT_TYPES, STORAGE_BUCKETS } from "@/lib/config";

const TYPE_LABELS = Object.fromEntries(
  GARMENT_TYPES.map((t) => [t.value, t.label]),
);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function GenerationsPage() {
  const supabase = await createClient();

  // RLS: solo gli shooting dell'utente corrente.
  const { data: generations } = await supabase
    .from("generations")
    .select(
      "id, garment_type, generated_image_url, cost_in_credits, created_at",
    )
    .order("created_at", { ascending: false });

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
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            I tuoi shooting
          </h1>
          <p className="text-muted-foreground mt-1">
            Lo storico delle immagini generate con il Virtual Try-On.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/generations/new">
            <Plus className="size-4" />
            Nuovo shooting
          </Link>
        </Button>
      </div>

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((g, i) => (
            <li
              key={g.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Link
                href={`/dashboard/generations/${g.id}`}
                className="hover:border-brand-400/60 block overflow-hidden rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="bg-muted aspect-[3/4] w-full">
                  {g.imageUrl ? (
                    <SmoothImage
                      src={g.imageUrl}
                      alt="Shooting generato"
                      className="size-full"
                    />
                  ) : (
                    <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 text-xs">
                      <Clock className="size-5" />
                      In lavorazione
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-2 text-sm">
                  <span className="truncate">
                    {TYPE_LABELS[g.garment_type] ?? g.garment_type}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {formatDate(g.created_at)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<ImageIcon className="size-6" />}
          title="Ancora nessuno shooting"
          description="Carica un capo e genera il tuo primo scatto: con modello o packshot per l'e-commerce."
          action={
            <Button asChild variant="brand" size="sm">
              <Link href="/dashboard/generations/new">
                <Plus className="size-4" />
                Crea il primo shooting
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
