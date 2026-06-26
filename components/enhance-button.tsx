"use client";

import { useActionState } from "react";
import { Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CREDITS_PER_ENHANCEMENT } from "@/lib/config";
import {
  enhanceGeneration,
  type EnhanceState,
} from "@/app/dashboard/generations/actions";

export function EnhanceButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<EnhanceState, FormData>(
    enhanceGeneration,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="brand" disabled={pending} className="w-fit">
        {pending ? <Spinner className="text-white" /> : <Wand2 className="size-4" />}
        {pending ? "Miglioramento…" : "Migliora foto"}
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
          <Sparkles className="size-3" />
          {CREDITS_PER_ENHANCEMENT}
        </span>
      </Button>

      {pending ? (
        <p className="text-muted-foreground text-xs">
          Affiniamo resa dei tessuti, dettaglio e nitidezza, senza alterare il
          volto. ~20 secondi.
        </p>
      ) : state?.error ? (
        <p role="alert" className="text-destructive text-xs">
          {state.error}
        </p>
      ) : state?.ok ? (
        <p className="text-xs font-medium text-emerald-600">
          Foto migliorata.
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">
          Più dettaglio e resa dei tessuti, in alta risoluzione. Volto e
          connotati restano invariati.
        </p>
      )}
    </form>
  );
}
