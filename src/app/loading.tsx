import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center px-4 pt-[4.5rem]">
      <div className="w-full max-w-4xl space-y-5">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
