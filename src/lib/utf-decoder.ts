export const decodeBase64UTF8 = (str: string): string => {
  try {
    // Decode base64
    const binaryString = atob(str);
    // Convert binary string to UTF-8
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // Decode UTF-8
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return str;
  }
};

export function fixEncoding(str: string): string {
  // 1. Convert the mis-decoded string back to bytes
  const bytes = new Uint8Array([...str].map((c) => c.charCodeAt(0)));

  // 2. Decode as UTF-8
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}
