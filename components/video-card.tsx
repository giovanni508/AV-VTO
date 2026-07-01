import { Download, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteVideo } from "@/app/dashboard/videos/actions";

export function VideoCard({
  id,
  videoUrl,
  label,
  meta,
}: {
  id: string;
  videoUrl: string | null;
  label: string;
  meta: string;
}) {
  const downloadUrl = videoUrl
    ? `${videoUrl}&download=${encodeURIComponent(`${label}.mp4`)}`
    : null;

  return (
    <div className="group overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md">
      <div className="bg-muted aspect-[3/4] w-full">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            loop
            muted
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{label}</p>
          <p className="text-muted-foreground truncate text-xs">{meta}</p>
        </div>
        <div className="flex shrink-0 items-center">
          {downloadUrl ? (
            <a
              href={downloadUrl}
              aria-label="Scarica video"
              className="text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md"
            >
              <Download className="size-4" />
            </a>
          ) : null}
          <form action={deleteVideo}>
            <input type="hidden" name="id" value={id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Elimina video"
              className="text-muted-foreground hover:text-destructive size-8"
            >
              <Trash2 className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
