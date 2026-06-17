/**
 * Costanti applicative condivise tra client e server.
 * (Nessun segreto qui: questo file può finire anche nel bundle del client.)
 */

/** Crediti scalati per ogni shooting generato. */
export const CREDITS_PER_GENERATION = 10;

/** Dimensione massima accettata per gli upload immagine (deve stare sotto il
 *  bucket `file_size_limit` di Supabase e sotto il bodySizeLimit di Next). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const STORAGE_BUCKETS = {
  garments: "garments",
  generations: "generations",
  models: "models",
} as const;

/**
 * Come è fotografato il capo di partenza. Coincide col CHECK della colonna
 * `generations.garment_type` (mannequin | flat_lay | model).
 */
export const GARMENT_TYPES = [
  { value: "model", label: "Indossato da un modello" },
  { value: "mannequin", label: "Su manichino" },
  { value: "flat_lay", label: "Flat lay (capo steso)" },
] as const;

/**
 * Categoria del capo: serve al modello di Virtual Try-On per capire dove
 * applicarlo sul corpo. NON è persistita (è solo un input per Replicate).
 */
export const GARMENT_CATEGORIES = [
  { value: "upper_body", label: "Parte superiore (t-shirt, camicia, giacca…)" },
  { value: "lower_body", label: "Parte inferiore (pantaloni, gonna…)" },
  { value: "dresses", label: "Vestito intero" },
] as const;

export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number]["value"];

/**
 * Modello Replicate usato per il try-on. Default: IDM-VTON.
 * Sovrascrivibile via env `REPLICATE_MODEL` ("owner/nome") senza toccare il codice.
 */
export const REPLICATE_MODEL =
  process.env.REPLICATE_MODEL ?? "cuuupid/idm-vton";
