import { cn } from "@/lib/utils";

/** Stato vuoto brandizzato: icona a gradiente, titolo, testo e CTA opzionale. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <div className="brand-gradient text-white shadow-brand inline-flex size-12 items-center justify-center rounded-full">
        {icon}
      </div>
      <div className="max-w-sm">
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
