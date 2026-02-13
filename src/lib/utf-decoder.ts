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

// Function to decode base64 string
// export const decodeBase64 = (encoded: string): string => {
//   try {
//     if (!encoded) return "";
//     // Check if the string looks like base64
//     if (/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
//       const binary = atob(encoded);
//       const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
//       // interpret bytes as UTF-8 text
//       const text = new TextDecoder("utf-8").decode(bytes);
//       return text;
//     }
//     return encoded;
//   } catch (error) {
//     console.error("Error decoding base64:", error);
//     return encoded;
//   }
// };

// Function to decode base64 with UTF-8 support
export const decodeBase64 = (str: string): string => {
  try {
    if (typeof window === "undefined") return str;
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

// Function to decode base64 with UTF-8 support
export const decodeBase64_Old = (str: string): string => {
  try {
    if (typeof window === "undefined") return str;
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

// UTF-8 base64 encode helper
export const encodeBase64UTF8 = (str: string): string => {
  try {
    // Encode UTF-8 to bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    // Convert bytes to binary string
    let binaryString = "";
    for (const byte of bytes) {
      binaryString += String.fromCharCode(byte);
    }
    // Encode to base64
    return btoa(binaryString);
  } catch {
    return str;
  }
};

export function decodeHtmlEntities(text: string): string {
  if (typeof document === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}
