import { cn } from "@/lib/utils";

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-line/60", className)} />;
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-1 py-1.5">
      <Skeleton className="h-14 w-2/3 self-start rounded-2xl" />
      <Skeleton className="h-10 w-1/2 self-end rounded-2xl" />
      <Skeleton className="h-16 w-3/4 self-start rounded-2xl" />
    </div>
  );
}

export function ListRowSkeleton({ rows = 3 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3.5 py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 flex-1 max-w-[160px]" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ cards = 2 }) {
  return (
    <div className="flex flex-col gap-3.5">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-line bg-paper p-4">
          <Skeleton className="mb-2 h-5 w-1/3" />
          <Skeleton className="mb-1.5 h-3.5 w-1/4" />
          <Skeleton className="h-3.5 w-full" />
        </div>
      ))}
    </div>
  );
}
