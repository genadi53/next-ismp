"use client";

interface SignalStrengthBarProps {
  strength: number;
  showLabel?: boolean;
}

export function SignalStrengthBar({
  strength,
  showLabel = true,
}: SignalStrengthBarProps) {
  const getColor = (value: number) => {
    if (value >= 70) return "text-green-600 dark:text-green-400";
    if (value >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-destructive";
  };

  const getGradient = (value: number) => {
    if (value >= 70)
      return "bg-gradient-to-r from-green-200 to-green-600 dark:from-green-900/20 dark:to-green-400";
    if (value >= 40)
      return "bg-gradient-to-r from-yellow-200 to-yellow-600 dark:from-yellow-900/20 dark:to-yellow-400";
    return "bg-gradient-to-r from-red-200 to-red-600 dark:from-red-900/20 dark:to-red-400";
  };

  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex-1">
        <div className="bg-secondary relative h-2 w-full overflow-hidden rounded-full">
          <div
            className={`h-full transition-all duration-300 ${getGradient(strength)}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>
      {showLabel && (
        <span
          className={`font-mono text-sm font-medium tabular-nums ${getColor(strength)}`}
          data-testid="signal-strength-value"
        >
          {strength}%
        </span>
      )}
    </div>
  );
}
