import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewVideoForm } from "@/components/new-video-form";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/storage";
import { STORAGE_BUCKETS } from "@/lib/config";

// La generazione video (Seedance) può richiedere 1–3 minuti: serve Vercel Pro
// (function fino a 300s). Su Hobby (max 60s) usare clip da 5s o l'upgrade.
export const maxDuration = 300;

export default async function NewVideoPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sorgente pre-compilata: uno shooting già generato (pulsante "Anima").
  let source: { generationId: string; thumbUrl: string | null } | undefined;
  if (from) {
    const { data: generation } = await supabase
      .from("generations")
      .select("id, generated_image_url")
      .eq("id", from)
      .single();
    if (generation?.generated_image_url) {
      source = {
        generationId: generation.id,
        thumbUrl: await createSignedUrl(
          supabase,
          STORAGE_BUCKETS.generations,
          generation.generated_image_url,
        ),
      };
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/videos"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Tutti i video
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Nuovo video
        </h1>
        <p className="text-muted-foreground mt-1">
          Trasforma un&apos;immagine in un video con un movimento di camera
          cinematografico. Ideale per hero di siti e schede prodotto animate.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anima un&apos;immagine</CardTitle>
        </CardHeader>
        <CardContent>
          <NewVideoForm userId={user!.id} source={source} />
        </CardContent>
      </Card>
    </div>
  );
}
