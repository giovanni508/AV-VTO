import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

/**
 * Client Supabase per Server Components, Server Actions e Route Handlers.
 * Legge/scrive i cookie di sessione, così `auth.uid()` è valorizzato nelle
 * policy RLS. Va creato ad ogni richiesta (i cookie cambiano per richiesta).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll chiamato da un Server Component: ignorabile se il refresh
            // della sessione è gestito dal middleware.
          }
        },
      },
    },
  );
}
