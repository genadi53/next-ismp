"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  statusColor?: "success" | "warning" | "error" | "default";
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  statusColor = "default",
}: MetricCardProps) {
  const borderColors = {
    success: "border-l-chart-2",
    warning: "border-l-chart-3",
    error: "border-l-destructive",
    default: "border-l-primary",
  };

  return (
    <Card className={`border-l-4 ${borderColors[statusColor]}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <Icon className="text-muted-foreground h-5 w-5" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <p
            className="text-3xl font-bold"
            data-testid={`metric-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {value}
          </p>
          {trend && (
            <span
              className={`text-sm ${
                trend === "up"
                  ? "text-chart-2"
                  : trend === "down"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "−"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
