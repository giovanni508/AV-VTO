import { createClient } from "@/lib/supabase/client";

function extensionFor(type: string): string {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  return "jpg";
}

/**
 * Carica un'immagine DIRETTAMENTE dal browser su Supabase Storage, nel bucket
 * privato indicato e nella cartella dell'utente (`{userId}/...`, come richiesto
 * dalle policy RLS).
 *
 * Perché lato client e non in una Server Action? Su Vercel il body di una
 * function è limitato a ~4,5 MB: facendo passare lì le immagini, gli upload
 * grandi fallirebbero. Caricando dal browser aggiriamo del tutto il limite.
 * La sessione dell'utente è già nei cookie, quindi la RLS vede `auth.uid()`.
 */
export async function uploadImage(
  bucket: string,
  userId: string,
  file: File,
): Promise<{ path?: string; error?: string }> {
  const path = `${userId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type || "image/jpeg" });
  if (error) return { error: error.message };
  return { path };
}
