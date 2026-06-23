"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  updatePassword,
  type AccountState,
} from "@/app/dashboard/account/actions";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    updatePassword,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Nuova password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="••••••••"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">Conferma password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {state?.error ? (
        <p role="alert" aria-live="polite" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? <Spinner className="text-white" /> : null}
          {pending ? "Salvataggio…" : "Aggiorna password"}
        </Button>
        {state?.ok ? (
          <span className="text-sm font-medium text-emerald-600">
            Password aggiornata.
          </span>
        ) : null}
      </div>
    </form>
  );
}
