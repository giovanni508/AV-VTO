"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { generateVideo } from "@/lib/replicate";
import { storageObjectToDataUri } from "@/lib/storage";
import {
  CAMERA_MOVES,
  STORAGE_BUCKETS,
  VIDEO_DURATIONS,
  VIDEO_RESOLUTION,
  creditsForVideo,
  promptFor,
} from "@/lib/config";

export type VideoState = { error?: string; ok?: boolean } | undefined;

function isDuration(value: number): boolean {
  return VIDEO_DURATIONS.some((d) => d.value === value);
}

/**
 * Genera un video (animazione) da un'immagine sorgente:
 *  - `source_generation_id`: uno shooting già generato (bucket generations), oppure
 *  - `source_path`: un'immagine caricata dal browser (bucket garments).
 * Applica un movimento di camera predefinito. Costa crediti in base alla durata,
 * scalati solo a buon fine.
 */
export async function createVideo(
  _prev: VideoState,
  formData: FormData,
): Promise<VideoState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sourceGenerationId = String(
    formData.get("source_generation_id") ?? "",
  ).trim();
  const sourcePath = String(formData.get("source_path") ?? "").trim();
  const cameraMoveValue = String(formData.get("camera_move") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const duration = parseInt(String(formData.get("duration") ?? "5"), 10) || 5;

  if (!isDuration(duration)) return { error: "Durata non valida." };

  // Risolvi l'immagine sorgente (bucket + path) rispettando la RLS.
  let bucket: string;
  let path: string;
  if (sourceGenerationId) {
    const { data: generation } = await supabase
      .from("generations")
      .select("generated_image_url")
      .eq("id", sourceGenerationId)
      .single();
    if (!generation?.generated_image_url) {
      return { error: "Foto sorgente non trovata." };
    }
    bucket = STORAGE_BUCKETS.generations;
    path = generation.generated_image_url;
  } else if (sourcePath) {
    if (!sourcePath.startsWith(`${user.id}/`)) {
      return { error: "Immagine sorgente non valida." };
    }
    bucket = STORAGE_BUCKETS.garments;
    path = sourcePath;
  } else {
    return { error: "Allega o scegli un'immagine da animare." };
  }

  const cost = creditsForVideo(duration);

  const { data: profile } = await supabase
    .from("users")
    .select("credits_balance")
    .eq("id", user.id)
    .single();
  if (!profile || profile.credits_balance < cost) {
    return { error: "Crediti insufficienti per generare il video." };
  }

  const dataUri = await storageObjectToDataUri(supabase, bucket, path);
  if (!dataUri) return { error: "Immagine sorgente non leggibile." };

  const cameraMove = promptFor(CAMERA_MOVES, cameraMoveValue);
  const prompt = [
    description || "Subtle, natural, cinematic animation of the image.",
    `Camera: ${cameraMove}.`,
    "Keep the subject, product, colors, patterns and identity exactly the same,",
    "photorealistic, smooth natural motion, no morphing, no distortion, high quality.",
  ]
    .filter(Boolean)
    .join(" ");

  let outputUrl: string;
  try {
    outputUrl = await generateVideo({ image: dataUri, prompt, duration });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Generazione del video non riuscita. Riprova.",
    };
  }

  // Addebito atomico (solo dopo che il video è stato prodotto).
  const { error: chargeError } = await supabase.rpc("consume_credits", {
    p_cost: cost,
  });
  if (chargeError) {
    return {
      error: chargeError.message.includes("Crediti insufficienti")
        ? "Crediti insufficienti per generare il video."
        : "Addebito dei crediti non riuscito.",
    };
  }

  // Scarica il file e salvalo nel bucket dei video (cartella utente).
  const videoPath = `${user.id}/${randomUUID()}.mp4`;
  try {
    const response = await fetch(outputUrl);
    const contentType = response.headers.get("content-type") || "video/mp4";
    const buffer = Buffer.from(await response.arrayBuffer());
    const upload = await supabase.storage
      .from(STORAGE_BUCKETS.videos)
      .upload(videoPath, buffer, { contentType, upsert: true });
    if (upload.error) return { error: "Salvataggio del video non riuscito." };
  } catch {
    return { error: "Salvataggio del video non riuscito." };
  }

  const insert = await supabase.from("videos").insert({
    user_id: user.id,
    source_image_url: path,
    video_url: videoPath,
    prompt: description || null,
    camera_move: cameraMoveValue || null,
    duration,
    resolution: VIDEO_RESOLUTION,
    cost_in_credits: cost,
  });
  if (insert.error) {
    await supabase.storage.from(STORAGE_BUCKETS.videos).remove([videoPath]);
    return { error: "Salvataggio del video non riuscito." };
  }

  revalidatePath("/dashboard/videos");
  revalidatePath("/dashboard");
  redirect("/dashboard/videos");
}

/** Elimina un video (riga + file). Le RLS garantiscono che sia il proprio. */
export async function deleteVideo(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: video } = await supabase
    .from("videos")
    .select("video_url")
    .eq("id", id)
    .single();

  await supabase.from("videos").delete().eq("id", id);
  if (video?.video_url) {
    await supabase.storage.from(STORAGE_BUCKETS.videos).remove([video.video_url]);
  }

  revalidatePath("/dashboard/videos");
}
