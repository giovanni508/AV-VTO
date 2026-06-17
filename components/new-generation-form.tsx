"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CREDITS_PER_GENERATION,
  GARMENT_CATEGORIES,
  GARMENT_TYPES,
} from "@/lib/config";
import {
  createGeneration,
  type GenerationState,
} from "@/app/dashboard/generations/actions";

type ModelOption = { id: string; name: string | null };

const selectClass =
  "border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

export function NewGenerationForm({ models }: { models: ModelOption[] }) {
  const [state, formAction, pending] = useActionState<GenerationState, FormData>(
    createGeneration,
    undefined,
  );
  const [preview, setPreview] = useState<string | null>(null);

  if (models.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
        Prima di generare uno shooting devi aggiungere almeno un modello.{" "}
        <Link
          href="/dashboard/models"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Aggiungi un modello
        </Link>
        .
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
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

      {state?.error ? (
        <p role="alert" className="text-destructive text-sm" aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          <Sparkles className="size-4" />
          {pending ? "Generazione in corso…" : "Genera shooting"}
        </Button>
        <span className="text-muted-foreground text-sm">
          Costo: {CREDITS_PER_GENERATION} crediti
        </span>
      </div>

      {pending ? (
        <p className="text-muted-foreground text-sm">
          Il try-on può richiedere fino a un paio di minuti. Non chiudere la
          pagina.
        </p>
      ) : null}
    </form>
  );
}
