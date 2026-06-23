"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AccountState = { error?: string; ok?: boolean } | undefined;

/** Cambia la password dell'utente loggato. */
export async function updatePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "La password deve avere almeno 8 caratteri." };
  }
  if (password !== confirm) {
    return { error: "Le due password non coincidono." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "Aggiornamento della password non riuscito. Riprova." };
  }

  revalidatePath("/dashboard/account");
  return { ok: true };
}
