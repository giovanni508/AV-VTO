"use client";

import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  Minus,
  Plus,
  Shirt,
  Sparkles,
  UserRound,
  Wand2,
  X,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  AI_MODEL_PRESETS,
  CREDITS_PER_GENERATION,
  CREDITS_PER_PRODUCT_SHOT,
  GARMENT_CATEGORIES,
  GARMENT_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VARIATIONS,
  STORAGE_BUCKETS,
  type GenerationMode,
} from "@/lib/config";
import { uploadImage } from "@/lib/upload-client";
import {
  createGeneration,
  type GenerationState,
} from "@/app/dashboard/generations/actions";

type ModelOption = { id: string; name: string | null };

const pillSelect =
  "appearance-none rounded-full border border-white/10 bg-white/5 py-1.5 pr-8 pl-3 text-xs font-medium text-white/90 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#2fa0f7]/60 cursor-pointer [&>option]:bg-[#0b1020]";

function PillSelect({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <span className="relative inline-flex">
      <select
        aria-label={label}
        name={name}
        defaultValue={defaultValue}
        className={pillSelect}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-white/50" />
    </span>
  );
}

export function NewGenerationForm({
  models,
  userId,
}: {
  models: ModelOption[];
  userId: string;
}) {
  const [state, formAction] = useActionState<GenerationState, FormData>(
    createGeneration,
    undefined,
  );
  const [isGenerating, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerationMode>("with_model");
  const [quantity, setQuantity] = useState(1);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const withModel = mode === "with_model";
  const noModels = withModel && models.length === 0;
  const unitCost = withModel ? CREDITS_PER_GENERATION : CREDITS_PER_PRODUCT_SHOT;
  const totalCost = unitCost * quantity;
  const pending = uploading || isGenerating;
  const error = localError ?? state?.error;
  const canSubmit = !!garmentFile && !noModels && !pending;

  function pickFile(file: File | null) {
    setGarmentFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
    setLocalError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!garmentFile) {
      setLocalError("Allega la foto del capo.");
      return;
    }
    if (garmentFile.size > MAX_IMAGE_BYTES) {
      setLocalError("L'immagine del capo supera i 10 MB.");
      return;
    }

    const data = new FormData(event.currentTarget);

    setUploading(true);
    const { path, error: uploadError } = await uploadImage(
      STORAGE_BUCKETS.garments,
      userId,
      garmentFile,
    );
    setUploading(false);
    if (uploadError || !path) {
      setLocalError("Upload del capo non riuscito. Riprova.");
      return;
    }

    const payload = new FormData();
    payload.set("mode", mode);
    payload.set("quantity", String(quantity));
    payload.set("garment_type", String(data.get("garment_type") ?? ""));
    payload.set("description", String(data.get("description") ?? ""));
    payload.set("model", String(data.get("model") ?? ""));
    payload.set("garment_path", path);
    if (withModel) {
      payload.set("model_id", String(data.get("model_id") ?? ""));
      payload.set("category", String(data.get("category") ?? ""));
    }
    startTransition(() => formAction(payload));
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-hidden
        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
      />

      <div className="rounded-3xl border border-white/10 bg-[#0b1020] p-3 text-white shadow-xl sm:p-4">
        {/* Allegato */}
        {preview ? (
          <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 pr-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Capo allegato"
              className="size-11 rounded-xl object-cover"
            />
            <span className="text-xs text-white/70">Capo allegato</span>
            <button
              type="button"
              onClick={() => {
                pickFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              aria-label="Rimuovi il capo"
              className="ml-1 cursor-pointer rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

        {/* Prompt */}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Carica la foto del capo"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Plus className="size-5" />
          </button>
          <textarea
            name="description"
            aria-label="Descrizione del capo"
            rows={2}
            maxLength={200}
            placeholder="Descrivi il capo o aggiungi indicazioni (opzionale)…"
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/40"
          />
        </div>

        {/* Controlli: lane scrollabile + bottone Genera fisso a destra */}
        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5">
          {/* Modalità */}
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode("with_model")}
              aria-pressed={withModel}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors",
                withModel
                  ? "brand-gradient text-white"
                  : "text-white/65 hover:text-white",
              )}
            >
              <UserRound className="size-3.5" />
              Con modello
            </button>
            <button
              type="button"
              onClick={() => setMode("no_model")}
              aria-pressed={!withModel}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors",
                !withModel
                  ? "brand-gradient text-white"
                  : "text-white/65 hover:text-white",
              )}
            >
              <Shirt className="size-3.5" />
              Senza modello
            </button>
          </div>

          {/* Modello (con modello) */}
          {withModel ? (
            noModels ? (
              <Link
                href="/dashboard/models"
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                <Plus className="size-3.5" />
                Aggiungi un modello
              </Link>
            ) : (
              <PillSelect label="Modello" name="model_id">
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name ?? "Senza nome"}
                  </option>
                ))}
              </PillSelect>
            )
          ) : null}

          {/* Categoria (con modello) */}
          {withModel ? (
            <PillSelect label="Categoria del capo" name="category">
              {GARMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </PillSelect>
          ) : null}

          {/* Tipo di scatto */}
          <PillSelect label="Com'è fotografato il capo" name="garment_type">
            {GARMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </PillSelect>

          {/* Modello AI (avanzato) */}
          <PillSelect label="Modello AI" name="model" defaultValue="">
            {AI_MODEL_PRESETS.map((p) => (
              <option key={p.value || "default"} value={p.value}>
                {p.label}
              </option>
            ))}
          </PillSelect>

          {/* Variazioni */}
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1 py-0.5 text-xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Meno variazioni"
              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-9 text-center font-medium tabular-nums">
              {quantity}/{MAX_VARIATIONS}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(MAX_VARIATIONS, q + 1))}
              disabled={quantity >= MAX_VARIATIONS}
              aria-label="Più variazioni"
              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          </div>

          {/* Genera (fisso a destra) */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="brand-gradient inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {pending ? (
              <Spinner className="text-white" />
            ) : (
              <Wand2 className="size-4" />
            )}
            {uploading ? "Caricamento…" : isGenerating ? "Generazione…" : "Genera"}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
              <Sparkles className="size-3" />
              {totalCost}
            </span>
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" aria-live="polite" className="text-destructive text-sm">
          {error}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          {garmentFile
            ? `${withModel ? "Try-on con modello" : "Packshot senza modello"} · ${quantity} ${quantity > 1 ? "variazioni" : "variazione"} · ${totalCost} crediti`
            : "Allega la foto di un capo per iniziare."}
        </p>
      )}

      {isGenerating ? (
        <p className="text-muted-foreground text-sm">
          Può richiedere fino a un paio di minuti. Non chiudere la pagina.
        </p>
      ) : null}
    </form>
  );
}
