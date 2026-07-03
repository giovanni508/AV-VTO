import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Download, Film } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhanceButton } from "@/components/enhance-button";
import { SmoothImage } from "@/components/smooth-image";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/storage";
import { GARMENT_TYPES, STORAGE_BUCKETS } from "@/lib/config";

// Il miglioramento foto chiama Replicate (upscaler): può durare ~20-40s.
export const maxDuration = 60;

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
                <SmoothImage
                  src={garmentUrl}
                  alt="Capo originale"
                  className="size-full"
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
          <CardContent className="flex flex-col gap-4">
            <div className="bg-muted aspect-[3/4] w-full overflow-hidden rounded-md">
              {resultUrl ? (
                <SmoothImage
                  src={resultUrl}
                  alt="Risultato generato"
                  className="size-full"
                />
              ) : (
                <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 text-sm">
                  <Clock className="size-6" />
                  In lavorazione…
                </div>
              )}
            </div>

            {resultUrl ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <EnhanceButton id={generation.id} />
                  <Link
                    href={`/dashboard/videos/new?from=${generation.id}`}
                    className="border-brand-400/40 text-brand-600 hover:bg-brand-400/10 inline-flex w-fit items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Film className="size-4" />
                    Anima
                  </Link>
                </div>
                <a
                  href={`${resultUrl}&download`}
                  className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm font-medium"
                >
                  <Download className="size-4" />
                  Scarica foto
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
