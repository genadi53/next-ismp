"use client";

import { cn } from "@/lib/cn";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

// =============================================================================
// TYPES
// =============================================================================

type ActivityType = "productive" | "queue" | "spot" | "idle" | "maintenance";

interface ProductionEvent {
  start: string;
  end: string;
  activityType: ActivityType;
  tonsMoved: number | null;
  truckId: string;
  location: string;
}

// Minimal sparkline component
export function Sparkline({
  data,
  color = "currentColor",
  width = 60,
  height = 20,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Handle single data point or division by zero
  const points = data
    .map((value, index) => {
      const x =
        data.length === 1
          ? width / 2
          : (index / (data.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  // Use style attribute for CSS variables to work properly in SVG
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      style={{ display: "block", overflow: "visible" }}
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: color }}
      />
    </svg>
  );
}

// Gantt/Timeline component
export function GanttTimeline({ events }: { events: ProductionEvent[] }) {
  const activityColors: Record<ActivityType, string> = {
    productive: "bg-emerald-500",
    queue: "bg-amber-500",
    spot: "bg-blue-500",
    idle: "bg-gray-400",
    maintenance: "bg-red-500",
  };

  const activityLabels: Record<ActivityType, string> = {
    productive: "Продуктивно",
    queue: "Опашка",
    spot: "Позициониране",
    idle: "В покой",
    maintenance: "Поддръжка",
  };

  // Parse time to minutes from midnight
  const timeToMinutes = (time: string) => {
    const parts = time.split(":").map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    return hours * 60 + minutes;
  };

  const startMinutes = Math.min(...events.map((e) => timeToMinutes(e.start)));
  const endMinutes = Math.max(...events.map((e) => timeToMinutes(e.end)));
  const totalMinutes = endMinutes - startMinutes;

  const hours = [];
  for (
    let h = Math.floor(startMinutes / 60);
    h <= Math.ceil(endMinutes / 60);
    h++
  ) {
    hours.push(h);
  }

  return (
    <div className="space-y-2">
      {/* Time axis */}
      <div className="text-muted-foreground flex justify-between px-1 text-xs">
        {hours.map((h) => (
          <span key={h}>{String(h).padStart(2, "0")}:00</span>
        ))}
      </div>

      {/* Timeline bar */}
      <div className="bg-muted flex h-8 overflow-hidden rounded-md">
        {events.map((event, i) => {
          const start = timeToMinutes(event.start);
          const end = timeToMinutes(event.end);
          const width = ((end - start) / totalMinutes) * 100;

          return (
            <div
              key={i}
              className={cn("h-full", activityColors[event.activityType])}
              style={{ width: `${width}%` }}
              title={`${event.activityType}: ${event.start} - ${event.end}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(activityColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className={cn("h-3 w-3 rounded-sm", color)} />
            <span>{activityLabels[type as ActivityType]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Gauge/Donut component
export function GaugeChart({ value, label }: { value: number; label: string }) {
  const data = [
    { name: "value", value: value },
    { name: "remaining", value: 100 - value },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={50}
            startAngle={180}
            endAngle={0}
            dataKey="value"
          >
            <Cell fill="hsl(var(--chart-1))" />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="-mt-8 text-center">
        <div className="text-2xl font-bold">{value}%</div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    </div>
  );
}
