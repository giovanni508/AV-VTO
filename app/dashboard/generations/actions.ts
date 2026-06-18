"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateTryOn } from "@/lib/replicate";
import { storageObjectToDataUri } from "@/lib/storage";
import {
  CREDITS_PER_GENERATION,
  GARMENT_CATEGORIES,
  GARMENT_TYPES,
  STORAGE_BUCKETS,
  type GarmentCategory,
} from "@/lib/config";
import type { GarmentType } from "@/lib/database.types";

export type GenerationState = { error: string } | undefined;

function isGarmentType(value: string): value is GarmentType {
  return GARMENT_TYPES.some((t) => t.value === value);
}

function isCategory(value: string): value is GarmentCategory {
  return GARMENT_CATEGORIES.some((c) => c.value === value);
}

/**
 * Pipeline completa di uno shooting Virtual Try-On. Il capo è già stato
 * caricato dal browser nello storage (`garment_path`): qui riceviamo solo il
 * riferimento, così non passano byte di immagine dalla Server Action.
 *   1. valida input + crediti
 *   2. genera con Replicate (modello + capo come data URI)
 *   3. scala i crediti e crea la riga `generations` (RPC atomica)
 *   4. salva il risultato e scrive l'URL (service_role)
 *
 * I crediti vengono scalati SOLO dopo che Replicate ha prodotto un risultato:
 * così un errore del modello non costa nulla all'utente.
 */
export async function createGeneration(
  _prev: GenerationState,
  formData: FormData,
): Promise<GenerationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const modelId = String(formData.get("model_id") ?? "");
  const garmentType = String(formData.get("garment_type") ?? "");
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const garmentPath = String(formData.get("garment_path") ?? "");

  if (!modelId) return { error: "Seleziona un modello." };
  if (!isGarmentType(garmentType)) return { error: "Tipo di scatto non valido." };
  if (!isCategory(category)) return { error: "Categoria del capo non valida." };
  // Il path deve stare nella cartella dell'utente (difesa in profondità: la
  // RLS lo impedirebbe comunque).
  if (!garmentPath || !garmentPath.startsWith(`${user.id}/`)) {
    return { error: "Immagine del capo non valida." };
  }

  // Il client service_role serve per scrivere il risultato (vietato al client).
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "Server non configurato: imposta SUPABASE_SERVICE_ROLE_KEY nelle variabili d'ambiente.",
    };
  }

  // Modello scelto (RLS: solo i propri).
  const { data: model } = await supabase
    .from("ai_models")
    .select("id, image_url")
    .eq("id", modelId)
    .single();
  if (!model) return { error: "Modello non trovato." };

  // Pre-check crediti per non sprecare una chiamata a pagamento.
  const { data: profile } = await supabase
    .from("users")
    .select("credits_balance")
    .eq("id", user.id)
    .single();
  if (!profile || profile.credits_balance < CREDITS_PER_GENERATION) {
    return { error: "Crediti insufficienti per generare lo shooting." };
  }

  // Prepara gli input per Replicate (data URI letti dallo storage).
  const [modelDataUri, garmentDataUri] = await Promise.all([
    storageObjectToDataUri(supabase, STORAGE_BUCKETS.models, model.image_url),
    storageObjectToDataUri(supabase, STORAGE_BUCKETS.garments, garmentPath),
  ]);
  if (!modelDataUri) {
    return { error: "Immagine del modello non leggibile." };
  }
  if (!garmentDataUri) {
    return { error: "Immagine del capo non leggibile." };
  }

  // 3. Genera con Replicate (può richiedere alcune decine di secondi).
  let outputUrl: string;
  try {
    outputUrl = await generateTryOn({
      humanImage: modelDataUri,
      garmentImage: garmentDataUri,
      category,
      description: description || undefined,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Generazione non riuscita. Riprova.",
    };
  }

  // 4. Scala i crediti + crea la riga (atomico, anti race-condition).
  const { data: generation, error: rpcError } = await supabase.rpc(
    "consume_credits_for_generation",
    {
      p_original_garment_url: garmentPath,
      p_garment_type: garmentType,
      p_cost: CREDITS_PER_GENERATION,
    },
  );
  if (rpcError || !generation) {
    return { error: rpcError?.message ?? "Addebito dei crediti non riuscito." };
  }

  // 5. Scarica il risultato, salvalo nello storage e scrivi l'URL (service_role).
  try {
    const response = await fetch(outputUrl);
    const resultBuffer = Buffer.from(await response.arrayBuffer());
    const resultPath = `${user.id}/${generation.id}.png`;

    await admin.storage
      .from(STORAGE_BUCKETS.generations)
      .upload(resultPath, resultBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    await admin
      .from("generations")
      .update({ generated_image_url: resultPath })
      .eq("id", generation.id);
  } catch {
    // La riga esiste già (crediti scalati): l'immagine resta null e lo
    // shooting comparirà come "in lavorazione". Non blocchiamo il flusso.
  }

  revalidatePath("/dashboard/generations");
  revalidatePath("/dashboard");
  redirect(`/dashboard/generations/${generation.id}`);
}
