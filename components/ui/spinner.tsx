import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** Spinner brandizzato (usa il blu del brand). */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("text-brand-400 size-4 animate-spin", className)}
      aria-hidden
    />
  );
}
