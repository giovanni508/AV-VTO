/**
 * Costanti applicative condivise tra client e server.
 * (Nessun segreto qui: questo file può finire anche nel bundle del client.)
 */

/** Crediti scalati per uno shooting con modello (Virtual Try-On). */
export const CREDITS_PER_GENERATION = 10;

/** Crediti scalati per un packshot senza modello (sfondo pulito). */
export const CREDITS_PER_PRODUCT_SHOT = 4;

/**
 * Modalità di generazione:
 *  - with_model: il capo indossato da un modello (Virtual Try-On).
 *  - no_model:   packshot e-commerce, capo isolato su sfondo pulito.
 */
export const GENERATION_MODES = [
  {
    value: "with_model",
    label: "Con modello",
    description: "Il capo indossato da un modello (Virtual Try-On).",
  },
  {
    value: "no_model",
    label: "Senza modello",
    description: "Packshot e-commerce: capo isolato su sfondo pulito.",
  },
] as const;

export type GenerationMode = (typeof GENERATION_MODES)[number]["value"];

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
 * Modello Replicate per il try-on con modello. Default: IDM-VTON.
 * Sovrascrivibile via env `REPLICATE_MODEL` ("owner/nome") senza toccare il codice.
 */
export const REPLICATE_MODEL =
  process.env.REPLICATE_MODEL ?? "cuuupid/idm-vton";

/**
 * Modello Replicate per il packshot senza modello (rimozione sfondo -> capo
 * isolato, pronto per e-commerce). Sovrascrivibile via `REPLICATE_PRODUCT_MODEL`.
 */
export const REPLICATE_PRODUCT_MODEL =
  process.env.REPLICATE_PRODUCT_MODEL ?? "851-labs/background-remover";
