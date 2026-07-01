import Link from "next/link";
import { Film, Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/storage";
import { CAMERA_MOVES, STORAGE_BUCKETS } from "@/lib/config";

const MOVE_LABELS = Object.fromEntries(
  CAMERA_MOVES.map((c) => [c.value, c.label]),
);

export default async function VideosPage() {
  const supabase = await createClient();

  // RLS: solo i video dell'utente corrente.
  const { data: videos } = await supabase
    .from("videos")
    .select("id, video_url, camera_move, duration, created_at")
    .order("created_at", { ascending: false });

  const items = await Promise.all(
    (videos ?? []).map(async (v) => ({
      ...v,
      url: await createSignedUrl(supabase, STORAGE_BUCKETS.videos, v.video_url),
    })),
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Video</h1>
          <p className="text-muted-foreground mt-1">
            Anima le tue foto prodotto e crea video hero con movimenti di camera
            predefiniti.
          </p>
        </div>
        <Button asChild variant="brand">
          <Link href="/dashboard/videos/new">
            <Plus className="size-4" />
            Nuovo video
          </Link>
        </Button>
      </div>

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((v, i) => (
            <li
              key={v.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <VideoCard
                id={v.id}
                videoUrl={v.url}
                label={MOVE_LABELS[v.camera_move ?? ""] ?? "Video"}
                meta={`${v.duration}s · ${new Date(v.created_at).toLocaleDateString("it-IT")}`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Film className="size-6" />}
          title="Nessun video ancora"
          description="Crea il primo video animando una foto prodotto o uno shooting. Trovi il pulsante Anima anche su ogni foto generata."
        />
      )}
    </div>
  );
}
