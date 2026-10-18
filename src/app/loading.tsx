import { Skeleton } from "@/components/ui/kit";

export default function Loading() {
  return (
    <div className="shell py-16">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-16 w-full max-w-2xl" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            <Skeleton className="mt-4 h-6 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
