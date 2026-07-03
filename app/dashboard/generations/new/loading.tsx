import { Skeleton } from "@/components/ui/skeleton";

export default function NewGenerationLoading() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-5xl flex-col">
      <div className="flex shrink-0 flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-44" />
      </div>

      {/* Griglia delle generazioni */}
      <div className="mt-6 flex-1">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Composer ancorato in basso */}
      <div className="sticky bottom-6 z-20 mt-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0b1020] p-4 shadow-xl">
          <div className="flex items-end gap-2">
            <Skeleton className="size-10 rounded-full bg-white/10" />
            <Skeleton className="h-10 flex-1 rounded-lg bg-white/10" />
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 pt-3">
            <Skeleton className="h-8 w-44 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
            <div className="flex-1" />
            <Skeleton className="h-10 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
