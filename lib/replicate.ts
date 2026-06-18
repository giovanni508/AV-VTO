import { REPLICATE_MODEL, REPLICATE_PRODUCT_MODEL } from "@/lib/config";

/**
 * Client minimale per Replicate (senza dipendenze: solo fetch).
 *
 * Usiamo l'endpoint /v1/models/{owner}/{name}/predictions che lancia la
 * predizione sulla versione di default del modello: così non dobbiamo
 * hardcodare hash di versione che cambiano nel tempo.
 *
 * Le immagini sono passate come data URI (base64): nessun bisogno che il
 * modello raggiunga un URL pubblico (utile anche in locale).
 */

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

export type TryOnInput = {
  /** Immagine della persona (data URI o URL pubblico). */
  humanImage: string;
  /** Immagine del capo (data URI o URL pubblico). */
  garmentImage: string;
  /** Dove va applicato il capo. */
  category: "upper_body" | "lower_body" | "dresses";
  /** Descrizione testuale opzionale del capo. */
  description?: string;
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

/**
 * Genera un'immagine di Virtual Try-On (capo indossato dal modello) e ritorna
 * l'URL del risultato.
 */
export async function generateTryOn(input: TryOnInput): Promise<string> {
  const prediction = await runModel(REPLICATE_MODEL, {
    human_img: input.humanImage,
    garm_img: input.garmentImage,
    garment_des: input.description || "capo di abbigliamento",
    category: input.category,
  });
  return extractImageUrl(prediction.output);
}

/**
 * Genera un packshot e-commerce senza modello: isola il capo rimuovendo lo
 * sfondo. Ritorna l'URL dell'immagine risultante.
 */
export async function generateProductShot(garmentImage: string): Promise<string> {
  const prediction = await runModel(REPLICATE_PRODUCT_MODEL, {
    image: garmentImage,
  });
  return extractImageUrl(prediction.output);
}

/**
 * Risolve l'hash di versione di un modello. Accetta sia "owner/nome" (legge la
 * versione di default via API) sia "owner/nome:hash" (versione fissata).
 *
 * Necessario perché l'endpoint /v1/models/.../predictions vale solo per i
 * modelli "ufficiali"; per quelli della community (es. IDM-VTON) serve la
 * versione esplicita su /v1/predictions, altrimenti si riceve un 404.
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
      // Chiede a Replicate di attendere (fino a ~60s) prima di rispondere:
      // spesso la predizione è già pronta e saltiamo del tutto il polling.
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

/** L'output dei modelli è di solito una stringa URL o un array di URL. */
function extractImageUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  throw new Error("Output del modello in un formato inatteso.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
