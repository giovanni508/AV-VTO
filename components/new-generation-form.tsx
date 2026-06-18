"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { Shirt, Sparkles, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  CREDITS_PER_GENERATION,
  CREDITS_PER_PRODUCT_SHOT,
  GARMENT_CATEGORIES,
  GARMENT_TYPES,
  MAX_IMAGE_BYTES,
  STORAGE_BUCKETS,
  type GenerationMode,
} from "@/lib/config";
import { uploadImage } from "@/lib/upload-client";
import {
  createGeneration,
  type GenerationState,
} from "@/app/dashboard/generations/actions";

type ModelOption = { id: string; name: string | null };

const selectClass =
  "border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

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
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerationMode>("with_model");

  const withModel = mode === "with_model";
  const noModels = withModel && models.length === 0;
  const cost = withModel ? CREDITS_PER_GENERATION : CREDITS_PER_PRODUCT_SHOT;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const data = new FormData(event.currentTarget);
    const file = data.get("garment");
    if (!(file instanceof File) || file.size === 0) {
      setLocalError("Carica l'immagine del capo.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setLocalError("L'immagine del capo supera i 10 MB.");
      return;
    }

    // 1. Carica il capo direttamente su Supabase Storage dal browser.
    setUploading(true);
    const { path, error } = await uploadImage(
      STORAGE_BUCKETS.garments,
      userId,
      file,
    );
    setUploading(false);
    if (error || !path) {
      setLocalError("Upload del capo non riuscito. Riprova.");
      return;
    }

    // 2. Avvia la generazione passando solo il riferimento allo storage.
    const payload = new FormData();
    payload.set("mode", mode);
    payload.set("garment_type", String(data.get("garment_type") ?? ""));
    payload.set("description", String(data.get("description") ?? ""));
    payload.set("garment_path", path);
    if (withModel) {
      payload.set("model_id", String(data.get("model_id") ?? ""));
      payload.set("category", String(data.get("category") ?? ""));
    }
    startTransition(() => formAction(payload));
  }

  const pending = uploading || isGenerating;
  const error = localError ?? state?.error;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {/* Switch modalità */}
      <div className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1">
        <ModeTab
          active={withModel}
          onClick={() => setMode("with_model")}
          icon={<UserRound className="size-4" />}
          label="Con modello"
          hint={`${CREDITS_PER_GENERATION} cr.`}
        />
        <ModeTab
          active={!withModel}
          onClick={() => setMode("no_model")}
          icon={<Shirt className="size-4" />}
          label="Senza modello"
          hint={`${CREDITS_PER_PRODUCT_SHOT} cr.`}
        />
      </div>
      <p className="text-muted-foreground -mt-2 text-sm">
        {withModel
          ? "Il capo verrà indossato dal modello scelto (Virtual Try-On)."
          : "Packshot e-commerce: il capo viene isolato su sfondo pulito."}
      </p>

      {withModel ? (
        noModels ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
            Per la modalità con modello serve almeno un modello.{" "}
            <Link
              href="/dashboard/models"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Aggiungine uno
            </Link>{" "}
            oppure passa a “Senza modello”.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="model_id">Modello</Label>
            <select id="model_id" name="model_id" required className={selectClass}>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name ?? "Senza nome"}
                </option>
              ))}
            </select>
          </div>
        )
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="garment">Foto del capo</Label>
        <Input
          id="garment"
          name="garment"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Anteprima capo"
            className="mt-1 size-24 rounded-md border object-cover"
          />
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {withModel ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoria del capo</Label>
            <select id="category" name="category" required className={selectClass}>
              {GARMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="garment_type">Com&apos;è fotografato</Label>
          <select
            id="garment_type"
            name="garment_type"
            required
            className={selectClass}
          >
            {GARMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrizione del capo (opzionale)</Label>
        <Input
          id="description"
          name="description"
          placeholder="Es. t-shirt bianca in cotone con stampa"
          maxLength={200}
        />
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm" aria-live="polite">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="brand" disabled={pending || noModels}>
          {pending ? <Spinner className="text-white" /> : <Sparkles className="size-4" />}
          {uploading
            ? "Caricamento capo…"
            : isGenerating
              ? "Generazione in corso…"
              : "Genera shooting"}
        </Button>
        <span className="text-muted-foreground text-sm">
          Costo: <span className="text-foreground font-medium">{cost} crediti</span>
        </span>
      </div>

      {isGenerating ? (
        <p className="text-muted-foreground text-sm">
          Può richiedere fino a un paio di minuti. Non chiudere la pagina.
        </p>
      ) : null}
    </form>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "brand-gradient text-white shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
      <span className={cn("text-xs", active ? "text-white/80" : "text-muted-foreground")}>
        {hint}
      </span>
    </button>
  );
}
