import { Skeleton } from "@/components/ui/skeleton";

export default function CasosLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
      <div className="rounded-xl border-border bg-(--paper) overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-5 w-20 rounded-full shrink-0" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
