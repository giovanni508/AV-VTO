"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addModel, type ModelState } from "@/app/dashboard/models/actions";

export function AddModelForm() {
  const [state, formAction, pending] = useActionState<ModelState, FormData>(
    addModel,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Dopo un salvataggio riuscito resettiamo il form (operazione sul DOM): il
  // reset emette l'evento `reset`, che ripulisce l'anteprima via onReset.
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onReset={() => setPreview(null)}
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="model-name">Nome (opzionale)</Label>
        <Input
          id="model-name"
          name="name"
          placeholder="Es. Modella studio"
          maxLength={80}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="model-image">Foto del modello</Label>
        <Input
          id="model-image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
      </div>

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Anteprima modello"
          className="size-16 rounded-md border object-cover"
        />
      ) : null}

      <Button type="submit" disabled={pending}>
        <UserPlus className="size-4" />
        {pending ? "Caricamento…" : "Aggiungi modello"}
      </Button>

      {state?.error ? (
        <p role="alert" className="text-destructive text-sm sm:self-center">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
