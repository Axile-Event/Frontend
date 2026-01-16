import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("animate-pulse relative overflow-hidden rounded-md bg-muted/60", className)}
      {...props}>
        <div className="absolute inset-0 animate-shimmer" />
      </div>)
  );
}

export { Skeleton }
