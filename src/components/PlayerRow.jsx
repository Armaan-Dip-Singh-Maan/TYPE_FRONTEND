import { Progress } from "./ui/progress.jsx";
import { Badge } from "./ui/badge.jsx";

export default function PlayerRow({ name, percent = 0, highlight = false }) {
  return (
    <div className={`rounded-lg border border-border p-3 ${highlight ? "bg-card/80" : "bg-card/50"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary grid place-items-center font-semibold">
            {name?.slice(0,1)?.toUpperCase()}
          </div>
          <div className="font-medium">{name}</div>
        </div>
        <Badge>{Math.round(percent)}%</Badge>
      </div>
      <Progress value={percent} />
    </div>
  );
}
