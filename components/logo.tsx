import { Shirt } from "lucide-react";

import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const BOX: Record<LogoSize, string> = {
  sm: "size-7 rounded-md",
  md: "size-8 rounded-lg",
  lg: "size-11 rounded-xl",
};
const ICON: Record<LogoSize, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-6",
};
const WORD: Record<LogoSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

/** Marchio del brand: tile a gradiente con icona + wordmark "AV·VTO". */
export function Logo({
  size = "md",
  withWordmark = true,
  className,
}: {
  size?: LogoSize;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "brand-gradient shadow-brand-700/40 inline-flex items-center justify-center text-white shadow-sm",
          BOX[size],
        )}
      >
        <Shirt className={ICON[size]} />
      </span>
      {withWordmark ? (
        <span className={cn("font-bold tracking-tight", WORD[size])}>
          AV<span className="text-gradient">·VTO</span>
        </span>
      ) : null}
    </span>
  );
}
