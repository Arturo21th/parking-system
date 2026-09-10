import { formatCents } from "@/lib/parking";

type Point = { date: string; totalCents: number };

/** Simple Tailwind-only bar chart — avoids pulling in a charting library for
 * what's a small, easily-verified visualization. */
export function RevenueChart({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.map((d) => d.totalCents));

  return (
    <div className="flex items-end gap-1.5 h-40">
      {data.map((d) => {
        const heightPct = Math.max(2, (d.totalCents / max) * 100);
        const day = new Date(d.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        return (
          <div
            key={d.date}
            className="group relative flex-1 flex flex-col items-center justify-end h-full"
          >
            <div className="absolute -top-6 hidden group-hover:block text-xs bg-foreground text-background px-1.5 py-0.5 rounded whitespace-nowrap">
              {formatCents(d.totalCents)}
            </div>
            <div
              className="w-full rounded-t bg-primary/80 group-hover:bg-primary transition-colors"
              style={{ height: `${heightPct}%` }}
            />
            <span className="mt-1 text-[10px] text-muted-foreground rotate-0 whitespace-nowrap">
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
