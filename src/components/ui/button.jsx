import { cn } from "../../lib/utils.js";

export function Button({
  as: Comp = "button",
  className = "",
  variant = "default",
  size = "default",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-primary text-white hover:bg-primary/90 shadow-glow",
    secondary: "bg-card border border-border text-foreground hover:bg-card/80",
    ghost: "bg-transparent hover:bg-card/60",
  };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-9 px-3", icon: "h-10 w-10" };
  return <Comp className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
