import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Crea un URL firmato (temporaneo) per un oggetto in un bucket PRIVATO.
 * I bucket `garments`/`generations`/`models` non sono pubblici: per mostrarne
 * il contenuto nel browser serve un signed URL a tempo.
 */
export async function createSignedUrl(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

/** Converte un oggetto di storage in data URI base64 (per inviarlo a Replicate). */
export async function storageObjectToDataUri(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string,
): Promise<string | null> {
  const { data } = await supabase.storage.from(bucket).download(path);
  if (!data) return null;
  const buffer = Buffer.from(await data.arrayBuffer());
  const mime = data.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}
