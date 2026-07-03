import { Skeleton } from "@/components/ui/skeleton";

export default function GenerationDetailLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="aspect-[3/4] w-full rounded-md" />
            {i === 1 ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-36 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
