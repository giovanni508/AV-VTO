import { cn } from "@/lib/utils";

/** Blocco skeleton con shimmer, per gli stati di caricamento. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden />;
}
