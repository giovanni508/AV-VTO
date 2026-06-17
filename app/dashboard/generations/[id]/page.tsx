import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/storage";
import { GARMENT_TYPES, STORAGE_BUCKETS } from "@/lib/config";

const TYPE_LABELS = Object.fromEntries(
  GARMENT_TYPES.map((t) => [t.value, t.label]),
);

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS: la query torna la riga solo se appartiene all'utente.
  const { data: generation } = await supabase
    .from("generations")
    .select(
      "id, garment_type, original_garment_url, generated_image_url, cost_in_credits, created_at",
    )
    .eq("id", id)
    .single();

  if (!generation) notFound();

  const [garmentUrl, resultUrl] = await Promise.all([
    createSignedUrl(
      supabase,
      STORAGE_BUCKETS.garments,
      generation.original_garment_url,
    ),
    createSignedUrl(
      supabase,
      STORAGE_BUCKETS.generations,
      generation.generated_image_url,
    ),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/generations"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Tutti gli shooting
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Shooting</h1>
        <p className="text-muted-foreground mt-1">
          {TYPE_LABELS[generation.garment_type] ?? generation.garment_type} ·{" "}
          {generation.cost_in_credits} crediti ·{" "}
          {new Date(generation.created_at).toLocaleString("it-IT")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Capo originale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted aspect-[3/4] w-full overflow-hidden rounded-md">
              {garmentUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={garmentUrl}
                  alt="Capo originale"
                  className="size-full object-cover"
                />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Risultato Virtual Try-On
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted aspect-[3/4] w-full overflow-hidden rounded-md">
              {resultUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resultUrl}
                  alt="Risultato generato"
                  className="size-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 text-sm">
                  <Clock className="size-6" />
                  In lavorazione…
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
