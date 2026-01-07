"use client";

import { Badge } from "@/components/ui/badge";

interface CCQBadgeProps {
  tx: number;
  rx: number;
}

export function CCQBadge({ tx, rx }: CCQBadgeProps) {
  const getBgColor = (value: number) => {
    if (value >= 80) return "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20";
    if (value >= 60) return "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20";
    return "bg-destructive/10 text-destructive hover:bg-destructive/20";
  };

  return (
    <div className="flex items-center gap-1" data-testid="ccq-badge">
      <Badge
        variant="outline"
        className={`font-mono text-xs tabular-nums ${getBgColor(tx)}`}
        data-testid="ccq-tx"
      >
        TX: {tx}%
      </Badge>
      <Badge
        variant="outline"
        className={`font-mono text-xs tabular-nums ${getBgColor(rx)}`}
        data-testid="ccq-rx"
      >
        RX: {rx}%
      </Badge>
    </div>
  );
}
