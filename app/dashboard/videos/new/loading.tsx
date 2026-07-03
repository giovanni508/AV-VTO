import { Skeleton } from "@/components/ui/skeleton";

export default function NewVideoLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="flex flex-col gap-5 rounded-xl border p-6">
        <Skeleton className="h-5 w-44" />
        <div className="flex items-center gap-4">
          <Skeleton className="aspect-[3/4] w-28 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-full max-w-xs" />
            <Skeleton className="h-8 w-40 rounded-md" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>
    </div>
  );
}
