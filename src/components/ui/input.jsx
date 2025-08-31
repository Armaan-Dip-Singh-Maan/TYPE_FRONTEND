import { cn } from "../../lib/utils.js";


export function Input({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      {...props}
    />
  );
}
