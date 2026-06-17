import { REPLICATE_MODEL } from "@/lib/config";

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
 * Genera un'immagine di Virtual Try-On e ritorna l'URL del risultato.
 * Lancia un'eccezione con messaggio leggibile in caso di errore/timeout.
 */
export async function generateTryOn(input: TryOnInput): Promise<string> {
  const [owner, name] = REPLICATE_MODEL.split("/");
  if (!owner || !name) {
    throw new Error(`REPLICATE_MODEL non valido: "${REPLICATE_MODEL}".`);
  }

  const res = await fetch(
    `${REPLICATE_API}/models/${owner}/${name}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken()}`,
        "Content-Type": "application/json",
        // Chiede a Replicate di attendere (fino a ~60s) prima di rispondere:
        // spesso la predizione è già pronta e saltiamo del tutto il polling.
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          human_img: input.humanImage,
          garm_img: input.garmentImage,
          garment_des: input.description || "capo di abbigliamento",
          category: input.category,
        },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Replicate ha rifiutato la richiesta (HTTP ${res.status}). ${detail}`.trim(),
    );
  }

  let prediction = (await res.json()) as Prediction;
  prediction = await waitForCompletion(prediction);

  if (prediction.status !== "succeeded") {
    throw new Error(
      prediction.error || `Generazione non riuscita (stato: ${prediction.status}).`,
    );
  }

  return extractImageUrl(prediction.output);
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

/** L'output dei modelli VTO è di solito una stringa URL o un array di URL. */
function extractImageUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  throw new Error("Output del modello in un formato inatteso.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
