"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/config";

export type ModelState = { error?: string; ok?: boolean } | undefined;

/**
 * Crea la riga ai_models. La foto è già stata caricata dal browser nello
 * storage (`image_path`): qui riceviamo solo il riferimento.
 */
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
  const imagePath = String(formData.get("image_path") ?? "");

  // Difesa in profondità: il path deve stare nella cartella dell'utente.
  if (!imagePath || !imagePath.startsWith(`${user.id}/`)) {
    return { error: "Immagine del modello non valida." };
  }

  const insert = await supabase.from("ai_models").insert({
    user_id: user.id,
    image_url: imagePath,
    name: name || null,
  });
  if (insert.error) {
    // Niente riga DB => non lasciamo file orfani nello storage.
    await supabase.storage.from(STORAGE_BUCKETS.models).remove([imagePath]);
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
