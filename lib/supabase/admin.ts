import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Client Supabase con privilegi `service_role`: BYPASSA la RLS.
 *
 * Da usare ESCLUSIVAMENTE lato server (Server Action / Route Handler) per le
 * operazioni che l'utente non può fare dal client per design — in particolare
 * scrivere `generations.generated_image_url` quando il try-on è pronto.
 *
 * La chiave non deve MAI avere il prefisso NEXT_PUBLIC_ né arrivare al browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY mancante: necessaria per salvare i risultati delle generazioni.",
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
