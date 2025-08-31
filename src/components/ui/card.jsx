import { cn } from "../../lib/utils.js";


export function Card({ className = "", ...props }) {
  return <div className={cn("rounded-xl border border-border bg-card p-4", className)} {...props} />;
}
export function CardHeader({ className = "", ...props }) {
  return <div className={cn("mb-2 flex items-center justify-between", className)} {...props} />;
}
export function CardTitle({ className = "", ...props }) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />;
}
export function CardDescription({ className = "", ...props }) {
  return <p className={cn("text-sm opacity-80", className)} {...props} />;
}
export function CardContent({ className = "", ...props }) {
  return <div className={cn("mt-2", className)} {...props} />;
}
