import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-xl bg-[#EAE5DE]", className)}
      {...props}
    />
  );
}

export function RouteLoadingSkeleton() {
  return (
    <main
      aria-label="Loading page"
      aria-busy="true"
      className="min-h-screen bg-[#FAF8F5] p-4 sm:p-6 lg:p-10"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="size-10" />
        </div>
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    </main>
  );
}

export function ListSkeleton({
  items = 4,
  className,
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div
      aria-label="Loading content"
      aria-busy="true"
      className={cn("space-y-3", className)}
    >
      {Array.from({ length: items }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-[#EEE9E2] p-4"
        >
          <Skeleton className="size-10 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingSlotsSkeleton() {
  return (
    <div
      aria-label="Loading available time slots"
      aria-busy="true"
      className="h-full rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-lg"
    >
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="size-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeletonRows({
  rows = 6,
  columns,
}: {
  rows?: number;
  columns: number;
}) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} className="border-t border-[#F0EDE7]">
      {Array.from({ length: columns }, (__, column) => (
        <td key={column} className="px-5 py-4">
          <Skeleton className="h-4 w-full rounded-md" />
        </td>
      ))}
    </tr>
  ));
}
