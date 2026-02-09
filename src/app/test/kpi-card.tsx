"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export function KPICard({
  title,
  value,
  unit,
  plan,
  planUnit,
  delta,
  trend,
  sparkline,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  unit?: string;
  plan?: number;
  planUnit?: string;
  delta: number | string;
  trend: "up" | "down" | "stable";
  sparkline: number[];
  icon?: React.ElementType;
}) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    stable: "text-muted-foreground",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className="min-w-[140px] flex-1">
      <CardContent className="mb-0 px-4 pb-0">
        <div className="flex w-full items-start justify-between">
          <div className="w-full space-y-1">
            <p className="text-muted-foreground text-base font-medium">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{value}</span>
              {unit && (
                <span className="text-muted-foreground text-sm">{unit}</span>
              )}
            </div>
            <div
              className={cn(
                "flex w-full items-center justify-between gap-1 text-sm",
                trendColors[trend],
              )}
            >
              {plan && (
                <div className="text-sm font-medium">
                  План: {plan} {planUnit}
                </div>
              )}
              <div className="flex flex-row items-center gap-1 pl-2.5">
                <TrendIcon className="size-5" />
                <span>
                  {typeof delta === "number"
                    ? delta >= 0
                      ? `+${delta}`
                      : delta
                    : delta}
                </span>
              </div>
            </div>
          </div>
          {Icon && <Icon className="text-muted-foreground size-6" />}
        </div>
        <div className="mt-2">
          <Sparkline
            data={sparkline}
            color="var(--chart-1)"
            width={80}
            height={24}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Minimal sparkline component
function Sparkline({
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
