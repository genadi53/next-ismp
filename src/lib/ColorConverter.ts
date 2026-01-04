export function ColorConverter(value: string, toRgb: boolean): string {
  if (toRgb) {
    // Convert HEX → RGB
    let hex = value.replace("#", "").trim();

    if (hex.length === 3) {
      // Expand shorthand (#abc → #aabbcc)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }

    if (hex.length !== 6) {
      throw new Error("Invalid HEX format");
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `(${r},${g},${b})`;
  } else {
    // Convert RGB → HEX
    const rgbMatch = value.match(/\d+/g);

    if (!rgbMatch || rgbMatch.length !== 3) {
      throw new Error("Invalid RGB format. Expected format: (r,g,b)");
    }

    const [r, g, b] = rgbMatch.map(Number);

    if ([r, g, b].some((n) => n !== undefined && (n < 0 || n > 255))) {
      throw new Error("RGB values must be between 0 and 255");
    }

    return (
      "#" +
      [r, g, b]
        .map((n) => (n !== undefined ? n.toString(16).padStart(2, "0") : ""))
        .join("")
        .toUpperCase()
    );
  }
}
