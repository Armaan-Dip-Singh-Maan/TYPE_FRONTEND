import { cn } from "../../lib/utils.js";


export function Progress({ value = 0, className = "" }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-border", className)}>
      <div className="h-full bg-primary transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}
