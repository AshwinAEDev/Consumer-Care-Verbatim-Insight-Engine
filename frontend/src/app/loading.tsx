import { FeedSkeleton } from "@/components/insight-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <FeedSkeleton />
    </div>
  );
}
