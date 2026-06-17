"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { MAX_IMAGE_BYTES, STORAGE_BUCKETS } from "@/lib/config";

export type ModelState = { error?: string; ok?: boolean } | undefined;

function extensionFor(type: string): string {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  return "jpg";
}

/** Carica una foto di modello nello storage e crea la riga in ai_models. */
export async function addModel(
  _prev: ModelState,
  formData: FormData,
): Promise<ModelState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return { error: "Carica un'immagine del modello." };
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return { error: "L'immagine supera i 10 MB." };
  }

  const path = `${user.id}/${randomUUID()}.${extensionFor(image.type)}`;
  const buffer = Buffer.from(await image.arrayBuffer());

  const upload = await supabase.storage
    .from(STORAGE_BUCKETS.models)
    .upload(path, buffer, { contentType: image.type || "image/jpeg" });
  if (upload.error) {
    return { error: "Upload dell'immagine non riuscito." };
  }

  const insert = await supabase.from("ai_models").insert({
    user_id: user.id,
    image_url: path,
    name: name || null,
  });
  if (insert.error) {
    // Rollback: niente riga DB => non lasciamo file orfani nello storage.
    await supabase.storage.from(STORAGE_BUCKETS.models).remove([path]);
    return { error: "Salvataggio del modello non riuscito." };
  }

  revalidatePath("/dashboard/models");
  return { ok: true };
}

/** Elimina un modello (riga + file). Le RLS garantiscono che sia il proprio. */
export async function deleteModel(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: model } = await supabase
    .from("ai_models")
    .select("image_url")
    .eq("id", id)
    .single();

  await supabase.from("ai_models").delete().eq("id", id);
  if (model?.image_url) {
    await supabase.storage.from(STORAGE_BUCKETS.models).remove([model.image_url]);
  }

  revalidatePath("/dashboard/models");
}
