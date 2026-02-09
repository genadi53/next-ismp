/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
// Dynamic require() for Winston logger is necessary for conditional server-side loading
// Client-side console logger fallback
const consoleLogger = {
  info: (message: string, metadata?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, metadata ?? "");
  },
  debug: (message: string, metadata?: Record<string, unknown>) => {
    console.debug(`[DEBUG] ${message}`, metadata ?? "");
  },
  warn: (message: string, metadata?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, metadata ?? "");
  },
  error: (message: string, metadata?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, metadata ?? "");
  },
};

/**
 * Get the appropriate logger based on environment
 * On server: uses Winston file logger
 * On client: falls back to console
 */
function getLogger() {
  // On server, try to use Winston logger
  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { logger } = require("@/server/logger");
      return logger;
    } catch {
      // If server logger not available, fall back to console
      return consoleLogger;
    }
  }

  // Client-side: always use console
  return consoleLogger;
}

/**
 * Log a message (replacement for console.log)
 * Writes to info.log on server, console on client
 *
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function log(message: string, ...args: unknown[]): void {
  const metadata = args.length > 0 ? { additionalData: args } : {};
  getLogger().info(message, metadata);
}

/**
 * Log an informational message
 * Writes to info.log on server, console on client
 *
 * @param message - Message to log
 * @param metadata - Optional metadata object
 */
export function logInfo(
  message: string,
  metadata?: Record<string, unknown>,
): void {
  getLogger().info(message, metadata);
}

/**
 * Log a debug message
 * Writes to info.log on server, console on client
 *
 * @param message - Message to log
 * @param metadata - Optional metadata object
 */
export function logDebug(
  message: string,
  metadata?: Record<string, unknown>,
): void {
  getLogger().debug(message, metadata);
}

/**
 * Log a warning message
 * Writes to info.log on server, console on client
 *
 * @param message - Message to log
 * @param metadata - Optional metadata object
 */
export function logWarn(
  message: string,
  metadata?: Record<string, unknown>,
): void {
  getLogger().warn(message, metadata);
}

/**
 * Log an error message
 * Writes to error.log on server, console on client
 *
 * @param message - Error message to log
 * @param error - Optional Error object
 * @param metadata - Optional metadata object
 */
export function logError(
  message: string,
  error?: unknown,
  metadata?: Record<string, unknown>,
): void {
  const errorMetadata: Record<string, unknown> = {
    ...metadata,
  };

  if (error instanceof Error) {
    errorMetadata.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  } else if (error !== undefined) {
    errorMetadata.error = error;
  }

  getLogger().error(message, errorMetadata);
}

// Re-export logger instance for advanced usage (server-side only)
// Dynamically import to avoid issues in client-side code
let serverLoggerInstance: ReturnType<typeof getLogger> | null = null;

function getServerLogger() {
  if (serverLoggerInstance) {
    return serverLoggerInstance;
  }
  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { logger } = require("@/server/logger");
      serverLoggerInstance = logger;
      return logger;
    } catch {
      serverLoggerInstance = consoleLogger;
      return consoleLogger;
    }
  }
  serverLoggerInstance = consoleLogger;
  return consoleLogger;
}

export const logger = getServerLogger();
