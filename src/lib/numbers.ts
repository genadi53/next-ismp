// Helper function to format numbers
export const formatNumber = (
  value: number | null | undefined,
  digits = 2,
): string => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits ? digits : 0,
  }).format(value);
};

// Helper function to format percentages
export const formatPercentage = (
  value: number | null | undefined,
  digits = 0,
): string => {
  if (value === null || value === undefined) return "-";
  return `${formatNumber(value, digits)}%`;
};
