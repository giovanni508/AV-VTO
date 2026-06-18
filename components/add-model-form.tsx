"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_IMAGE_BYTES, STORAGE_BUCKETS } from "@/lib/config";
import { uploadImage } from "@/lib/upload-client";
import { addModel, type ModelState } from "@/app/dashboard/models/actions";

export function AddModelForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<ModelState, FormData>(
    addModel,
    undefined,
  );
  const [isSaving, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Dopo un salvataggio riuscito resettiamo il form (DOM): il reset emette
  // l'evento `reset`, che ripulisce l'anteprima via onReset.
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const data = new FormData(event.currentTarget);
    const file = data.get("image");
    if (!(file instanceof File) || file.size === 0) {
      setLocalError("Carica un'immagine del modello.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setLocalError("L'immagine supera i 10 MB.");
      return;
    }

    setUploading(true);
    const { path, error } = await uploadImage(
      STORAGE_BUCKETS.models,
      userId,
      file,
    );
    setUploading(false);
    if (error || !path) {
      setLocalError("Upload dell'immagine non riuscito. Riprova.");
      return;
    }

    const payload = new FormData();
    payload.set("name", String(data.get("name") ?? ""));
    payload.set("image_path", path);
    startTransition(() => formAction(payload));
  }

  const pending = uploading || isSaving;
  const error = localError ?? state?.error;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
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
        {uploading ? "Caricamento…" : isSaving ? "Salvataggio…" : "Aggiungi modello"}
      </Button>

      {error ? (
        <p role="alert" className="text-destructive text-sm sm:self-center">
          {error}
        </p>
      ) : null}
    </form>
  );
}
