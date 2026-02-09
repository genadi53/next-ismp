/**
 * Calculate duration in seconds between two time strings (HH:MM or HH:MM:SS)
 */
export function calculateDuration(
  endTime: string | null,
  startTime: string | null,
): number {
  if (!endTime || !startTime) return 0;

  const parseTime = (time: string): number => {
    const parts = time.split(":").map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    const seconds = parts[2] ?? 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  return parseTime(endTime) - parseTime(startTime);
}
