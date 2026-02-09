"use client";

interface LiveIndicatorProps {
  lastUpdate?: string;
}

export function LiveIndicator({ lastUpdate = "току-що" }: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-2" data-testid="live-indicator">
      <div className="relative flex h-3 w-3">
        <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
        <span className="bg-primary relative inline-flex h-3 w-3 rounded-full"></span>
      </div>
      <span className="text-muted-foreground text-sm">
        На живо · {lastUpdate}
      </span>
    </div>
  );
}
