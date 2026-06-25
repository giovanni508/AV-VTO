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
  FRAMINGS,
  GARMENT_CATEGORIES,
  GARMENT_TYPES,
  GENERATION_MODES,
  LIGHTING,
  MAX_VARIATIONS,
  POSES,
  PRODUCT_ANGLES,
  PRODUCT_BACKGROUNDS,
  REPLICATE_MODEL,
  REPLICATE_PRODUCT_MODEL,
  SCENES,
  STORAGE_BUCKETS,
  promptFor,
  type GarmentCategory,
  type GenerationMode,
} from "@/lib/config";
import type { GarmentType } from "@/lib/database.types";

export type GenerationState = { error: string } | undefined;

type AdminClient = ReturnType<typeof createAdminClient>;

function isGarmentType(value: string): value is GarmentType {
  return GARMENT_TYPES.some((t) => t.value === value);
}
function isCategory(value: string): value is GarmentCategory {
  return GARMENT_CATEGORIES.some((c) => c.value === value);
}
function isMode(value: string): value is GenerationMode {
  return GENERATION_MODES.some((m) => m.value === value);
}

/** Scarica il risultato di Replicate e lo salva (service_role). */
async function saveResult(
  admin: AdminClient,
  userId: string,
  generationId: string,
  outputUrl: string,
): Promise<void> {
  const response = await fetch(outputUrl);
  const contentType = response.headers.get("content-type") || "image/png";
  const ext =
    contentType.includes("jpeg") || contentType.includes("jpg")
      ? "jpg"
      : contentType.includes("webp")
        ? "webp"
        : "png";
  const buffer = Buffer.from(await response.arrayBuffer());
  const path = `${userId}/${generationId}.${ext}`;

  await admin.storage
    .from(STORAGE_BUCKETS.generations)
    .upload(path, buffer, { contentType, upsert: true });
  await admin
    .from("generations")
    .update({ generated_image_url: path })
    .eq("id", generationId);
}

/**
 * Pipeline di uno o più shooting. Il capo è già nello storage (`garment_path`).
 * Le variazioni sono generate in parallelo; i crediti vengono scalati solo per
 * le immagini effettivamente prodotte (una RPC atomica per ognuna).
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
  const modelOverride = String(formData.get("model") ?? "").trim();
  const quantity = Math.min(
    Math.max(parseInt(String(formData.get("quantity") ?? "1"), 10) || 1, 1),
    MAX_VARIATIONS,
  );

  // Variabili dello scatto (mappate su frammenti di prompt).
  const pose = promptFor(POSES, String(formData.get("pose") ?? ""));
  const framing = promptFor(FRAMINGS, String(formData.get("framing") ?? ""));
  const scene = promptFor(SCENES, String(formData.get("scene") ?? ""));
  const lighting = promptFor(LIGHTING, String(formData.get("lighting") ?? ""));
  const productBg = promptFor(
    PRODUCT_BACKGROUNDS,
    String(formData.get("product_bg") ?? ""),
  );
  const productAngle = promptFor(
    PRODUCT_ANGLES,
    String(formData.get("product_angle") ?? ""),
  );

  if (!isMode(mode)) return { error: "Modalità non valida." };
  if (!isGarmentType(garmentType)) return { error: "Tipo di scatto non valido." };
  if (!garmentPath || !garmentPath.startsWith(`${user.id}/`)) {
    return { error: "Immagine del capo non valida." };
  }

  const withModel = mode === "with_model";
  const cost = withModel ? CREDITS_PER_GENERATION : CREDITS_PER_PRODUCT_SHOT;
  const totalCost = cost * quantity;

  if (withModel) {
    if (!modelId) return { error: "Seleziona un modello." };
    if (!isCategory(category)) return { error: "Categoria del capo non valida." };
  }

  const replicateModel = withModel
    ? modelOverride || REPLICATE_MODEL
    : modelOverride && !modelOverride.includes("idm-vton")
      ? modelOverride
      : REPLICATE_PRODUCT_MODEL;

  let admin: AdminClient;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "Server non configurato: imposta SUPABASE_SERVICE_ROLE_KEY nelle variabili d'ambiente.",
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("credits_balance")
    .eq("id", user.id)
    .single();
  if (!profile || profile.credits_balance < totalCost) {
    return { error: "Crediti insufficienti per generare gli shooting." };
  }

  const garmentDataUri = await storageObjectToDataUri(
    supabase,
    STORAGE_BUCKETS.garments,
    garmentPath,
  );
  if (!garmentDataUri) return { error: "Immagine del capo non leggibile." };

  let modelDataUri: string | null = null;
  if (withModel) {
    const { data: aiModel } = await supabase
      .from("ai_models")
      .select("image_url")
      .eq("id", modelId)
      .single();
    if (!aiModel) return { error: "Modello non trovato." };
    modelDataUri = await storageObjectToDataUri(
      supabase,
      STORAGE_BUCKETS.models,
      aiModel.image_url,
    );
    if (!modelDataUri) return { error: "Immagine del modello non leggibile." };
  }

  // Genera tutte le variazioni in parallelo.
  const tasks = Array.from({ length: quantity }, () =>
    withModel
      ? generateTryOn({
          model: replicateModel,
          humanImage: modelDataUri!,
          garmentImage: garmentDataUri,
          category: category as GarmentCategory,
          description: description || undefined,
          pose,
          framing,
          scene,
          lighting,
        })
      : generateProductShot({
          model: replicateModel,
          garmentImage: garmentDataUri,
          description: description || undefined,
          background: productBg,
          angle: productAngle,
          lighting,
        }),
  );
  const settled = await Promise.allSettled(tasks);
  const outputs = settled
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value);

  if (outputs.length === 0) {
    const rejected = settled.find((r) => r.status === "rejected");
    const reason = (rejected as PromiseRejectedResult | undefined)?.reason;
    return {
      error:
        reason instanceof Error ? reason.message : "Generazione non riuscita.",
    };
  }

  // Per ogni immagine prodotta: scala i crediti (atomico) e salva il risultato.
  const ids: string[] = [];
  for (const outputUrl of outputs) {
    const { data: generation, error: rpcError } = await supabase.rpc(
      "consume_credits_for_generation",
      {
        p_original_garment_url: garmentPath,
        p_garment_type: garmentType,
        p_cost: cost,
      },
    );
    if (rpcError || !generation) break; // crediti finiti: ci fermiamo
    try {
      await saveResult(admin, user.id, generation.id, outputUrl);
    } catch {
      // riga creata, immagine non salvata: resterà "in lavorazione"
    }
    ids.push(generation.id);
  }

  if (ids.length === 0) {
    return { error: "Addebito dei crediti non riuscito." };
  }

  revalidatePath("/dashboard/generations");
  revalidatePath("/dashboard");
  if (ids.length === 1) {
    redirect(`/dashboard/generations/${ids[0]}`);
  }
  redirect("/dashboard/generations");
}
