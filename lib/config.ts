/**
 * Costanti applicative condivise tra client e server.
 * (Nessun segreto qui: questo file può finire anche nel bundle del client.)
 */

/** Crediti scalati per uno shooting con modello (Virtual Try-On). */
export const CREDITS_PER_GENERATION = 10;

/** Crediti scalati per un packshot senza modello (sfondo pulito). */
export const CREDITS_PER_PRODUCT_SHOT = 4;

/** Numero massimo di variazioni generabili in un colpo solo. */
export const MAX_VARIATIONS = 4;

/** Crediti scalati per generare un modello (persona) con l'AI. */
export const CREDITS_PER_MODEL_GENERATION = 40;

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
  { value: "model", label: "Indossato" },
  { value: "mannequin", label: "Manichino" },
  { value: "flat_lay", label: "Flat lay" },
] as const;

/**
 * Categoria del capo: serve al modello di Virtual Try-On per capire dove
 * applicarlo sul corpo. NON è persistita (è solo un input per Replicate).
 */
export const GARMENT_CATEGORIES = [
  { value: "upper_body", label: "Parte superiore" },
  { value: "lower_body", label: "Parte inferiore" },
  { value: "dresses", label: "Vestito" },
] as const;

export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number]["value"];

/**
 * Modello Replicate per il try-on con modello. Default: Nano Banana 2
 * (Google Gemini Image) — miglior equilibrio realismo/fedeltà tra i modelli
 * disponibili su Replicate. Sovrascrivibile via env `REPLICATE_MODEL`.
 */
export const REPLICATE_MODEL =
  process.env.REPLICATE_MODEL ?? "google/nano-banana-2";

/**
 * Modello Replicate per il packshot senza modello. Default: Nano Banana 2.
 * Sovrascrivibile via `REPLICATE_PRODUCT_MODEL`.
 */
export const REPLICATE_PRODUCT_MODEL =
  process.env.REPLICATE_PRODUCT_MODEL ?? "google/nano-banana-2";

/**
 * Preset di modelli AI selezionabili dalla sezione "avanzate" del form.
 * value vuoto = usa il default configurato via env (consigliato).
 */
export const AI_MODEL_PRESETS = [
  { value: "", label: "Auto" },
  { value: "google/nano-banana-2", label: "Nano Banana 2" },
  { value: "google/nano-banana", label: "Nano Banana" },
  { value: "cuuupid/idm-vton", label: "IDM-VTON" },
] as const;

/** Modello Replicate per generare i modelli (persone) da zero. */
export const REPLICATE_MODEL_GEN =
  process.env.REPLICATE_MODEL_GEN ?? "google/nano-banana-2";

/**
 * Opzioni per la generazione di un modello (persona). Ogni opzione ha la sua
 * traduzione inglese (`prompt`) usata per costruire il prompt fotorealistico.
 */
export const MODEL_GENDERS = [
  { value: "donna", label: "Donna", prompt: "female" },
  { value: "uomo", label: "Uomo", prompt: "male" },
] as const;

export const MODEL_AGES = [
  { value: "18-25", label: "18–25 anni", prompt: "in their early twenties" },
  { value: "26-35", label: "26–35 anni", prompt: "around 30 years old" },
  { value: "36-45", label: "36–45 anni", prompt: "around 40 years old" },
  { value: "46-60", label: "46–60 anni", prompt: "in their fifties" },
  { value: "60+", label: "Oltre 60 anni", prompt: "in their late sixties, elderly" },
] as const;

export const MODEL_ETHNICITIES = [
  { value: "caucasica", label: "Caucasica", prompt: "Caucasian" },
  { value: "nera", label: "Nera / Africana", prompt: "Black African" },
  { value: "asiatica", label: "Asiatica (Est)", prompt: "East Asian" },
  { value: "sudasiatica", label: "Sud-asiatica", prompt: "South Asian" },
  { value: "ispanica", label: "Ispanica / Latina", prompt: "Hispanic Latina" },
  { value: "mediorientale", label: "Mediorientale", prompt: "Middle Eastern" },
] as const;

export const MODEL_BODY_TYPES = [
  { value: "esile", label: "Esile", prompt: "slim" },
  { value: "atletica", label: "Atletica", prompt: "athletic toned" },
  { value: "media", label: "Media", prompt: "average" },
  { value: "curvy", label: "Curvy / Plus-size", prompt: "curvy plus-size" },
] as const;

export const MODEL_HAIR_COLORS = [
  { value: "castani", label: "Castani", prompt: "brown" },
  { value: "neri", label: "Neri", prompt: "black" },
  { value: "biondi", label: "Biondi", prompt: "blonde" },
  { value: "rossi", label: "Rossi", prompt: "red" },
  { value: "grigi", label: "Grigi / Brizzolati", prompt: "grey" },
] as const;

export const MODEL_HAIR_LENGTHS = [
  { value: "corti", label: "Corti", prompt: "short" },
  { value: "medi", label: "Medi", prompt: "medium-length" },
  { value: "lunghi", label: "Lunghi", prompt: "long" },
] as const;

export type ModelOptionList = readonly {
  value: string;
  label: string;
  prompt: string;
}[];

/** Frammento di prompt (inglese) per il valore scelto; fallback alla prima opzione. */
export function promptFor(list: ModelOptionList, value: string): string {
  return (list.find((o) => o.value === value) ?? list[0]).prompt;
}

// ── Variabili dello shooting CON modello ───────────────────────────────────
export const POSES = [
  { value: "frontale", label: "In piedi, frontale", prompt: "standing straight, facing the camera" },
  { value: "tre_quarti", label: "Tre quarti", prompt: "standing in a relaxed three-quarter pose" },
  { value: "profilo", label: "Di profilo", prompt: "standing in profile, side view" },
  { value: "camminata", label: "In camminata", prompt: "walking towards the camera, mid-step" },
  { value: "mani_tasche", label: "Mani in tasca", prompt: "standing relaxed with hands in the pockets" },
  { value: "seduto", label: "Seduto", prompt: "sitting on a simple stool" },
] as const;

export const FRAMINGS = [
  { value: "intera", label: "Figura intera", prompt: "full-body framing, head to feet" },
  { value: "ginocchia", label: "Tre quarti (ginocchia)", prompt: "three-quarter framing, from the knees up" },
  { value: "mezzo_busto", label: "Mezzo busto", prompt: "waist-up framing" },
] as const;

export const SCENES = [
  { value: "studio_neutro", label: "Studio neutro", prompt: "clean neutral studio background" },
  { value: "bianco", label: "Fondo bianco", prompt: "pure white seamless studio background" },
  { value: "grigio", label: "Grigio chiaro", prompt: "light grey seamless studio background" },
  { value: "esterno_urbano", label: "Esterno urbano", prompt: "softly blurred urban street background, outdoors" },
  { value: "interno_minimal", label: "Interno minimal", prompt: "minimal modern interior background" },
  { value: "natura", label: "Natura", prompt: "soft natural outdoor background with greenery" },
] as const;

export const LIGHTING = [
  { value: "studio_soft", label: "Studio soft", prompt: "soft even professional studio lighting" },
  { value: "naturale", label: "Luce naturale", prompt: "soft natural daylight" },
  { value: "drammatica", label: "Drammatica", prompt: "dramatic directional lighting with soft shadows" },
  { value: "calda", label: "Calda", prompt: "warm golden-hour lighting" },
] as const;

// ── Variabili del packshot SENZA modello ───────────────────────────────────
export const PRODUCT_BACKGROUNDS = [
  { value: "bianco", label: "Bianco puro", prompt: "on a pure white seamless background" },
  { value: "grigio", label: "Grigio chiaro", prompt: "on a light grey seamless background" },
  { value: "legno", label: "Legno chiaro", prompt: "on a light wooden surface" },
  { value: "marmo", label: "Marmo", prompt: "on a white marble surface" },
  { value: "neutro", label: "Neutro caldo", prompt: "on a warm neutral beige background" },
] as const;

export const PRODUCT_ANGLES = [
  { value: "frontale", label: "Frontale", prompt: "front view, straight on" },
  { value: "tre_quarti", label: "Tre quarti", prompt: "three-quarter angle view" },
  { value: "flat_lay", label: "Dall'alto (flat lay)", prompt: "top-down flat lay view" },
  { value: "appeso", label: "Appeso", prompt: "hanging on a clothes hanger" },
] as const;
