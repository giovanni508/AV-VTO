"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Film, ImagePlus, Sparkles, Wand2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  CAMERA_MOVES,
  MAX_IMAGE_BYTES,
  STORAGE_BUCKETS,
  VIDEO_DURATIONS,
  creditsForVideo,
} from "@/lib/config";
import { uploadImage } from "@/lib/upload-client";
import { createVideo, type VideoState } from "@/app/dashboard/videos/actions";

const selectClass =
  "border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

export function NewVideoForm({
  userId,
  source,
}: {
  userId: string;
  /** Sorgente pre-compilata (dal pulsante "Anima" su uno shooting). */
  source?: { generationId: string; thumbUrl: string | null };
}) {
  const [state, formAction] = useActionState<VideoState, FormData>(
    createVideo,
    undefined,
  );
  const [isGenerating, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(VIDEO_DURATIONS[0].value);
  const fileRef = useRef<HTMLInputElement>(null);

  const pending = uploading || isGenerating;
  const error = localError ?? state?.error;
  // La sorgente è l'immagine caricata, altrimenti quella pre-compilata.
  const hasSource = !!file || !!source;
  const shownPreview = preview ?? source?.thumbUrl ?? null;
  const cost = creditsForVideo(duration);

  function pickFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setLocalError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!hasSource) {
      setLocalError("Allega o scegli un'immagine da animare.");
      return;
    }
    if (file && file.size > MAX_IMAGE_BYTES) {
      setLocalError("L'immagine supera i 10 MB.");
      return;
    }

    const data = new FormData(event.currentTarget);

    // Se l'utente ha caricato un'immagine, questa ha la precedenza sulla
    // sorgente pre-compilata (viene caricata nel bucket garments).
    if (file) {
      setUploading(true);
      const { path, error: uploadError } = await uploadImage(
        STORAGE_BUCKETS.garments,
        userId,
        file,
      );
      setUploading(false);
      if (uploadError || !path) {
        setLocalError("Upload dell'immagine non riuscito. Riprova.");
        return;
      }
      data.set("source_path", path);
      data.delete("source_generation_id");
    }

    data.set("duration", String(duration));
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {source ? (
        <input
          type="hidden"
          name="source_generation_id"
          value={source.generationId}
        />
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-hidden
        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
      />

      {/* Sorgente */}
      <div className="flex flex-col gap-2">
        <Label>Immagine da animare</Label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Scegli un'immagine"
            className="bg-muted hover:border-brand-400/60 relative flex aspect-[3/4] w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-colors"
          >
            {shownPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shownPreview}
                alt="Sorgente"
                className="size-full object-cover"
              />
            ) : (
              <span className="text-muted-foreground flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="size-5" />
                Carica
              </span>
            )}
          </button>
          <div className="text-muted-foreground flex flex-col gap-2 text-sm">
            <p>
              {source
                ? "Stai animando uno shooting. Puoi caricare un'altra immagine per sostituirla."
                : "Carica una foto prodotto o uno shooting da animare (JPG/PNG, max 10 MB)."}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus className="size-4" />
                {file ? "Cambia immagine" : "Carica immagine"}
              </Button>
              {file ? (
                <button
                  type="button"
                  onClick={() => {
                    pickFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  aria-label="Rimuovi immagine caricata"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
                >
                  <X className="size-4" />
                  Rimuovi
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Opzioni */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="camera_move">Movimento di camera</Label>
          <select
            id="camera_move"
            name="camera_move"
            aria-label="Movimento di camera"
            className={selectClass}
          >
            {CAMERA_MOVES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="duration">Durata</Label>
          <select
            id="duration"
            name="duration"
            aria-label="Durata"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className={selectClass}
          >
            {VIDEO_DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label} · {d.credits} crediti
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Indicazioni (opzionale)</Label>
        <textarea
          id="description"
          name="description"
          rows={2}
          maxLength={300}
          placeholder="Es. il tessuto ondeggia leggermente, atmosfera elegante…"
          className={cn(selectClass, "h-auto resize-none py-2")}
        />
      </div>

      {error ? (
        <p role="alert" aria-live="polite" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="brand" disabled={pending || !hasSource}>
          {pending ? (
            <Spinner className="text-white" />
          ) : (
            <Wand2 className="size-4" />
          )}
          {uploading
            ? "Caricamento…"
            : isGenerating
              ? "Generazione…"
              : "Genera video"}
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
            <Sparkles className="size-3" />
            {cost}
          </span>
        </Button>
        {isGenerating ? (
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
            <Film className="size-4" />
            Può richiedere 1–3 minuti. Non chiudere la pagina.
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">
            720p · {duration}s · {cost} crediti
          </span>
        )}
      </div>
    </form>
  );
}
