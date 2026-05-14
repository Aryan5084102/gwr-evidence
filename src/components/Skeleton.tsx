import { cn } from "@/lib/utils";

export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-lg shimmer h-4 w-full", className)} />;
}
