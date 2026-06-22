"use client";

import { useActionState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  MODEL_AGES,
  MODEL_BODY_TYPES,
  MODEL_ETHNICITIES,
  MODEL_GENDERS,
  MODEL_HAIR_COLORS,
  MODEL_HAIR_LENGTHS,
} from "@/lib/config";
import { generateModel, type ModelState } from "@/app/dashboard/models/actions";

const selectClass =
  "border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

function Field({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} aria-label={label} className={selectClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function GenerateModelForm() {
  const [state, formAction, pending] = useActionState<ModelState, FormData>(
    generateModel,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Genere" name="gender" options={MODEL_GENDERS} />
        <Field label="Età" name="age" options={MODEL_AGES} />
        <Field label="Etnia" name="ethnicity" options={MODEL_ETHNICITIES} />
        <Field label="Corporatura" name="body" options={MODEL_BODY_TYPES} />
        <Field
          label="Colore capelli"
          name="hair_color"
          options={MODEL_HAIR_COLORS}
        />
        <Field
          label="Lunghezza capelli"
          name="hair_length"
          options={MODEL_HAIR_LENGTHS}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nome (opzionale)</Label>
          <Input
            id="name"
            name="name"
            placeholder="Es. Modella studio"
            maxLength={80}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="note">Dettagli extra (opzionale)</Label>
          <Input
            id="note"
            name="note"
            placeholder="Es. sorriso, lentiggini, occhiali"
            maxLength={150}
          />
        </div>
      </div>

      {state?.error ? (
        <p role="alert" aria-live="polite" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="brand" disabled={pending}>
          {pending ? (
            <Spinner className="text-white" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {pending ? "Generazione…" : "Genera modello"}
        </Button>
        {pending ? (
          <span className="text-muted-foreground text-sm">
            Può richiedere ~30 secondi. Non chiudere la pagina.
          </span>
        ) : state?.ok ? (
          <span className="text-sm font-medium text-emerald-600">
            Modello generato e aggiunto.
          </span>
        ) : null}
      </div>
    </form>
  );
}
