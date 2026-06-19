"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateProductShot, generateTryOn } from "@/lib/replicate";
import { storageObjectToDataUri } from "@/lib/storage";
import {
  CREDITS_PER_GENERATION,
  CREDITS_PER_PRODUCT_SHOT,
  GARMENT_CATEGORIES,
  GARMENT_TYPES,
  GENERATION_MODES,
  REPLICATE_MODEL,
  REPLICATE_PRODUCT_MODEL,
  STORAGE_BUCKETS,
  type GarmentCategory,
  type GenerationMode,
} from "@/lib/config";
import type { GarmentType } from "@/lib/database.types";

export type GenerationState = { error: string } | undefined;

function isGarmentType(value: string): value is GarmentType {
  return GARMENT_TYPES.some((t) => t.value === value);
}

function isCategory(value: string): value is GarmentCategory {
  return GARMENT_CATEGORIES.some((c) => c.value === value);
}

function isMode(value: string): value is GenerationMode {
  return GENERATION_MODES.some((m) => m.value === value);
}

/**
 * Pipeline completa di uno shooting. Il capo è già stato caricato dal browser
 * nello storage (`garment_path`): qui riceviamo solo il riferimento, così non
 * passano byte di immagine dalla Server Action.
 *
 * Due modalità:
 *   - with_model: Virtual Try-On (capo indossato dal modello scelto).
 *   - no_model:   packshot e-commerce (capo isolato su sfondo pulito).
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

  const mode = String(formData.get("mode") ?? "with_model");
  const modelId = String(formData.get("model_id") ?? "");
  const garmentType = String(formData.get("garment_type") ?? "");
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const garmentPath = String(formData.get("garment_path") ?? "");
  // Override del modello AI (dalla sezione "avanzate", nascosta di default).
  const modelOverride = String(formData.get("model") ?? "").trim();

  if (!isMode(mode)) return { error: "Modalità non valida." };
  if (!isGarmentType(garmentType)) return { error: "Tipo di scatto non valido." };
  // Il path deve stare nella cartella dell'utente (difesa in profondità: la
  // RLS lo impedirebbe comunque).
  if (!garmentPath || !garmentPath.startsWith(`${user.id}/`)) {
    return { error: "Immagine del capo non valida." };
  }

  const withModel = mode === "with_model";
  const cost = withModel ? CREDITS_PER_GENERATION : CREDITS_PER_PRODUCT_SHOT;

  // Modello AI da usare: override se valido, altrimenti il default via env.
  // In modalità packshot un modello "vton" non è adatto: si ripiega sul default.
  const replicateModel = withModel
    ? modelOverride || REPLICATE_MODEL
    : modelOverride && !modelOverride.includes("idm-vton")
      ? modelOverride
      : REPLICATE_PRODUCT_MODEL;

  if (withModel) {
    if (!modelId) return { error: "Seleziona un modello." };
    if (!isCategory(category)) return { error: "Categoria del capo non valida." };
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

  // Pre-check crediti per non sprecare una chiamata a pagamento.
  const { data: profile } = await supabase
    .from("users")
    .select("credits_balance")
    .eq("id", user.id)
    .single();
  if (!profile || profile.credits_balance < cost) {
    return { error: "Crediti insufficienti per generare lo shooting." };
  }

  const garmentDataUri = await storageObjectToDataUri(
    supabase,
    STORAGE_BUCKETS.garments,
    garmentPath,
  );
  if (!garmentDataUri) {
    return { error: "Immagine del capo non leggibile." };
  }

  // Genera con Replicate (può richiedere alcune decine di secondi).
  let outputUrl: string;
  try {
    if (withModel) {
      const { data: aiModel } = await supabase
        .from("ai_models")
        .select("image_url")
        .eq("id", modelId)
        .single();
      if (!aiModel) return { error: "Modello non trovato." };

      const modelDataUri = await storageObjectToDataUri(
        supabase,
        STORAGE_BUCKETS.models,
        aiModel.image_url,
      );
      if (!modelDataUri) return { error: "Immagine del modello non leggibile." };

      outputUrl = await generateTryOn({
        model: replicateModel,
        humanImage: modelDataUri,
        garmentImage: garmentDataUri,
        category: category as GarmentCategory,
        description: description || undefined,
      });
    } else {
      outputUrl = await generateProductShot({
        model: replicateModel,
        garmentImage: garmentDataUri,
        description: description || undefined,
      });
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Generazione non riuscita. Riprova.",
    };
  }

  // Scala i crediti + crea la riga (atomico, anti race-condition).
  const { data: generation, error: rpcError } = await supabase.rpc(
    "consume_credits_for_generation",
    {
      p_original_garment_url: garmentPath,
      p_garment_type: garmentType,
      p_cost: cost,
    },
  );
  if (rpcError || !generation) {
    return { error: rpcError?.message ?? "Addebito dei crediti non riuscito." };
  }

  // Scarica il risultato, salvalo nello storage e scrivi l'URL (service_role).
  try {
    const response = await fetch(outputUrl);
    const contentType = response.headers.get("content-type") || "image/png";
    const ext = contentType.includes("jpeg") || contentType.includes("jpg")
      ? "jpg"
      : contentType.includes("webp")
        ? "webp"
        : "png";
    const resultBuffer = Buffer.from(await response.arrayBuffer());
    const resultPath = `${user.id}/${generation.id}.${ext}`;

    await admin.storage
      .from(STORAGE_BUCKETS.generations)
      .upload(resultPath, resultBuffer, {
        contentType,
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
