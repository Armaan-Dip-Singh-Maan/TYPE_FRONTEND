import { cn } from "../../lib/utils.js";

export function Badge({ className = "", children, variant = "default" }) {
  const styles =
    variant === "success"
      ? "bg-green-500/15 text-green-400 border border-green-500/30"
      : variant === "danger"
      ? "bg-red-500/15 text-red-400 border border-red-500/30"
      : "bg-card border border-border";
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs", styles, className)}>{children}</span>;
}
