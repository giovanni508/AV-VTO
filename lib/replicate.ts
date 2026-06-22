/**
 * Client minimale per Replicate (senza dipendenze: solo fetch).
 *
 * Risolviamo l'hash di versione del modello e lanciamo /v1/predictions: così
 * funziona per qualsiasi modello (anche community). Le immagini sono passate
 * come data URI (base64): nessun bisogno di hosting pubblico.
 *
 * Due "motori" supportati:
 *  - prompt (es. Nano Banana / Gemini): input { prompt, image_input: [...] }
 *  - vton   (IDM-VTON):                 input { human_img, garm_img, category }
 */

import { REPLICATE_MODEL_GEN } from "@/lib/config";

const REPLICATE_API = "https://api.replicate.com/v1";
const POLL_INTERVAL_MS = 2_500;
const TIMEOUT_MS = 110_000;

type PredictionStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

type Prediction = {
  id: string;
  status: PredictionStatus;
  output: unknown;
  error: string | null;
  urls: { get: string; cancel: string };
};

export type TryOnParams = {
  /** Modello "owner/nome" o "owner/nome:hash". */
  model: string;
  humanImage: string;
  garmentImage: string;
  category: "upper_body" | "lower_body" | "dresses";
  description?: string;
};

export type ProductParams = {
  model: string;
  garmentImage: string;
  description?: string;
};

const CATEGORY_WORDS: Record<string, string> = {
  upper_body: "an upper-body garment (top)",
  lower_body: "a lower-body garment (bottoms)",
  dresses: "a dress",
};

function authToken(): string {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error(
      "REPLICATE_API_TOKEN non configurato nelle variabili d'ambiente.",
    );
  }
  return token;
}

function modelPath(model: string): string {
  return model.split(":")[0];
}
function isVtonModel(model: string): boolean {
  return modelPath(model).endsWith("idm-vton");
}
function isBackgroundRemover(model: string): boolean {
  return modelPath(model).endsWith("background-remover");
}

function tryOnPrompt(category: string, description?: string): string {
  return [
    "Create a photorealistic, professional fashion e-commerce photograph.",
    "Dress the person shown in the FIRST image with the exact garment shown in the SECOND image,",
    "preserving the garment's color, pattern, texture, print and design precisely.",
    `The garment is ${CATEGORY_WORDS[category] ?? "a garment"}.`,
    "Keep the person's face, body proportions and a natural pose.",
    "Full-body framing, clean neutral studio background, soft professional lighting, sharp high detail.",
    description ? `Additional details: ${description}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function productPrompt(description?: string): string {
  return [
    "Create a professional e-commerce product photograph of the garment shown in the image.",
    "Present it as a clean studio packshot on a pure white seamless background,",
    "soft even lighting with a subtle shadow, centered, no person, ghost-mannequin style,",
    "true to the original color, pattern, texture and print, sharp high detail.",
    description ? `Additional details: ${description}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Try-on: capo indossato dal modello. Ritorna l'URL dell'immagine. */
export async function generateTryOn(params: TryOnParams): Promise<string> {
  const { model, humanImage, garmentImage, category, description } = params;

  const input = isVtonModel(model)
    ? {
        human_img: humanImage,
        garm_img: garmentImage,
        garment_des: description || "capo di abbigliamento",
        category,
      }
    : {
        prompt: tryOnPrompt(category, description),
        image_input: [humanImage, garmentImage],
        output_format: "png",
      };

  const prediction = await runModel(model, input);
  return extractImageUrl(prediction.output);
}

/** Packshot senza modello: capo isolato/studio. Ritorna l'URL dell'immagine. */
export async function generateProductShot(
  params: ProductParams,
): Promise<string> {
  const { model, garmentImage, description } = params;

  const input = isBackgroundRemover(model)
    ? { image: garmentImage }
    : {
        prompt: productPrompt(description),
        image_input: [garmentImage],
        output_format: "png",
      };

  const prediction = await runModel(model, input);
  return extractImageUrl(prediction.output);
}

/** Genera da zero un modello (persona) fotorealistico. Ritorna l'URL. */
export async function generateModelImage(prompt: string): Promise<string> {
  const prediction = await runModel(REPLICATE_MODEL_GEN, {
    prompt,
    aspect_ratio: "3:4",
    output_format: "png",
  });
  return extractImageUrl(prediction.output);
}

/**
 * Risolve l'hash di versione di un modello. Accetta "owner/nome" (legge la
 * versione di default via API) o "owner/nome:hash" (versione fissata).
 */
async function resolveVersion(model: string): Promise<string> {
  const [path, pinned] = model.split(":");
  if (pinned) return pinned;

  const res = await fetch(`${REPLICATE_API}/models/${path}`, {
    headers: { Authorization: `Bearer ${authToken()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Modello Replicate non trovato: "${path}" (HTTP ${res.status}).`,
    );
  }
  const data = (await res.json()) as { latest_version?: { id?: string } };
  const version = data.latest_version?.id;
  if (!version) {
    throw new Error(`Il modello "${path}" non ha una versione disponibile.`);
  }
  return version;
}

/** Lancia un modello (per versione) e attende il completamento. */
async function runModel(
  model: string,
  input: Record<string, unknown>,
): Promise<Prediction> {
  const version = await resolveVersion(model);

  const res = await fetch(`${REPLICATE_API}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken()}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({ version, input }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Replicate ha rifiutato la richiesta (HTTP ${res.status}). ${detail}`.trim(),
    );
  }

  const prediction = await waitForCompletion((await res.json()) as Prediction);

  if (prediction.status !== "succeeded") {
    throw new Error(
      prediction.error ||
        `Generazione non riuscita (stato: ${prediction.status}).`,
    );
  }

  return prediction;
}

async function waitForCompletion(prediction: Prediction): Promise<Prediction> {
  const deadline = Date.now() + TIMEOUT_MS;
  let current = prediction;

  while (
    current.status !== "succeeded" &&
    current.status !== "failed" &&
    current.status !== "canceled"
  ) {
    if (Date.now() > deadline) {
      throw new Error("Timeout: la generazione ha impiegato troppo tempo.");
    }
    await sleep(POLL_INTERVAL_MS);
    const poll = await fetch(current.urls.get, {
      headers: { Authorization: `Bearer ${authToken()}` },
      cache: "no-store",
    });
    current = (await poll.json()) as Prediction;
  }

  return current;
}

/** L'output è una stringa URL o un array di URL. */
function extractImageUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  throw new Error("Output del modello in un formato inatteso.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
