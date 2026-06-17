"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthState } from "@/app/(auth)/actions";

type AuthAction = (
  prevState: AuthState,
  formData: FormData,
) => Promise<AuthState>;

export function AuthForm({
  action,
  submitLabel,
  mode,
}: {
  action: AuthAction;
  submitLabel: string;
  mode: "login" | "signup";
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@negozio.it"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="••••••••"
          minLength={mode === "signup" ? 8 : undefined}
          required
        />
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="text-destructive text-sm"
          aria-live="polite"
        >
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Attendi…" : submitLabel}
      </Button>
    </form>
  );
}
