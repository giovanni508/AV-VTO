"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Download, Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SmoothImage } from "@/components/smooth-image";
import { deleteModel, renameModel } from "@/app/dashboard/models/actions";

export function ModelCard({
  id,
  name,
  imageUrl,
}: {
  id: string;
  name: string | null;
  imageUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [renaming, startRename] = useTransition();

  function onRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startRename(async () => {
      await renameModel(data);
      setEditing(false);
    });
  }

  // Chiudi il lightbox con Esc e blocca lo scroll del body mentre è aperto.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const label = name ?? "Senza nome";
  const downloadUrl = imageUrl
    ? `${imageUrl}&download=${encodeURIComponent(`${name ?? "modello"}.png`)}`
    : null;

  return (
    <>
      <div className="hover:border-brand-400/60 group relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!imageUrl}
          aria-label={`Apri ${label}`}
          className="bg-muted block aspect-[3/4] w-full cursor-pointer"
        >
          {imageUrl ? (
            <SmoothImage
              src={imageUrl}
              alt={label}
              className="size-full transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : null}
        </button>
        <div className="flex items-center justify-between gap-1 p-2">
          {editing ? (
            <form onSubmit={onRename} className="flex flex-1 items-center gap-1">
              <input type="hidden" name="id" value={id} />
              <input
                name="name"
                defaultValue={name ?? ""}
                autoFocus
                maxLength={60}
                placeholder="Nome del modello"
                aria-label="Nome del modello"
                className="focus-visible:ring-brand-400/50 w-full min-w-0 rounded-md border px-2 py-1 text-sm outline-none focus-visible:ring-2"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                disabled={renaming}
                aria-label="Salva nome"
                className="text-muted-foreground hover:text-brand-600 size-8 shrink-0"
              >
                {renaming ? <Spinner /> : <Check className="size-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditing(false)}
                aria-label="Annulla"
                className="text-muted-foreground hover:text-foreground size-8 shrink-0"
              >
                <X className="size-4" />
              </Button>
            </form>
          ) : (
            <>
              <span className="truncate text-sm font-medium">{label}</span>
              <div className="flex shrink-0 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(true)}
                  aria-label="Rinomina modello"
                  className="text-muted-foreground hover:text-foreground size-8"
                >
                  <Pencil className="size-4" />
                </Button>
                <form action={deleteModel}>
                  <input type="hidden" name="id" value={id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label="Elimina modello"
                    className="text-muted-foreground hover:text-destructive size-8"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {open && imageUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
          className="animate-fade-up fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          {/* Toolbar */}
          <div
            className="flex w-full max-w-3xl items-center justify-between gap-3 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate font-medium text-white">{label}</span>
            <div className="flex items-center gap-2">
              {downloadUrl ? (
                <a
                  href={downloadUrl}
                  className="brand-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  <Download className="size-4" />
                  Scarica
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Chiudi"
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={label}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      ) : null}
    </>
  );
}
