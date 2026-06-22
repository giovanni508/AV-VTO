"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { generateModelImage } from "@/lib/replicate";
import {
  MODEL_AGES,
  MODEL_BODY_TYPES,
  MODEL_ETHNICITIES,
  MODEL_GENDERS,
  MODEL_HAIR_COLORS,
  MODEL_HAIR_LENGTHS,
  STORAGE_BUCKETS,
  type ModelOptionList,
} from "@/lib/config";

export type ModelState = { error?: string; ok?: boolean } | undefined;

/** Frammento di prompt per il valore scelto (fallback alla prima opzione). */
function promptFor(list: ModelOptionList, value: string): string {
  return (list.find((o) => o.value === value) ?? list[0]).prompt;
}

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

/**
 * Genera da zero un modello (persona) iper-realistico dalle caratteristiche
 * scelte, lo salva nello storage e crea la riga ai_models.
 */
export async function generateModel(
  _prev: ModelState,
  formData: FormData,
): Promise<ModelState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const gender = promptFor(MODEL_GENDERS, String(formData.get("gender") ?? ""));
  const age = promptFor(MODEL_AGES, String(formData.get("age") ?? ""));
  const ethnicity = promptFor(
    MODEL_ETHNICITIES,
    String(formData.get("ethnicity") ?? ""),
  );
  const body = promptFor(MODEL_BODY_TYPES, String(formData.get("body") ?? ""));
  const hairColor = promptFor(
    MODEL_HAIR_COLORS,
    String(formData.get("hair_color") ?? ""),
  );
  const hairLength = promptFor(
    MODEL_HAIR_LENGTHS,
    String(formData.get("hair_length") ?? ""),
  );
  const name = String(formData.get("name") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  const prompt = [
    `Ultra-photorealistic full-body fashion studio photograph of a ${age} ${ethnicity} ${gender} fashion model`,
    `with ${hairLength} ${hairColor} hair and a ${body} build,`,
    "standing in a relaxed natural pose facing the camera, arms at the sides,",
    "wearing simple plain fitted neutral-coloured clothing (plain t-shirt and trousers),",
    "clean light grey seamless studio background, soft even professional studio lighting,",
    "sharp focus, realistic skin texture and pores, natural anatomy, high detail,",
    "shot on a full-frame camera, photorealistic, not an illustration or 3D render.",
    note,
  ]
    .filter(Boolean)
    .join(" ");

  let outputUrl: string;
  try {
    outputUrl = await generateModelImage(prompt);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Generazione del modello non riuscita. Riprova.",
    };
  }

  // Scarica il risultato e salvalo nel bucket dei modelli (cartella utente).
  const path = `${user.id}/${randomUUID()}.png`;
  try {
    const response = await fetch(outputUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const upload = await supabase.storage
      .from(STORAGE_BUCKETS.models)
      .upload(path, buffer, { contentType: "image/png" });
    if (upload.error) return { error: "Salvataggio del modello non riuscito." };
  } catch {
    return { error: "Salvataggio del modello non riuscito." };
  }

  const insert = await supabase.from("ai_models").insert({
    user_id: user.id,
    image_url: path,
    name: name || "Modello generato",
  });
  if (insert.error) {
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
