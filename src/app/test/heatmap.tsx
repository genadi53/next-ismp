"use client";

import { cn } from "@/lib/cn";

export const HEATMAP_DATA = [
  { type: "Камиони", values: [92, 88, 85, 90, 87, 91, 89] },
  { type: "Багери", values: [95, 92, 88, 94, 90, 93, 91] },
  { type: "Сонди", values: [88, 85, 90, 86, 89, 87, 88] },
  { type: "Поддръжка", values: [78, 82, 80, 85, 79, 83, 81] },
];

// Heatmap component
export function Heatmap({
  data,
  days,
}: {
  data: typeof HEATMAP_DATA;
  days: string[];
}) {
  const getColor = (value: number) => {
    if (value >= 90) return "bg-emerald-500";
    if (value >= 80) return "bg-emerald-400";
    if (value >= 70) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
      >
        <div />
        {days.map((day) => (
          <div key={day} className="text-muted-foreground text-center text-xs">
            {day}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.map((row) => (
        <div
          key={row.type}
          className="grid gap-1"
          style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
        >
          <div className="flex items-center text-xs">{row.type}</div>
          {row.values.map((val, i) => (
            <div
              key={i}
              className={cn(
                "flex h-6 items-center justify-center rounded text-xs font-medium text-white",
                getColor(val),
              )}
            >
              {val}%
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
