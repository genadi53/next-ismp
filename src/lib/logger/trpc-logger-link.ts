import { loggerLink } from "@trpc/client";
import type { TRPCLink } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";

/**
 * Custom tRPC logger link that logs all operations
 * On client: logs to console
 * Server-side logging is handled in tRPC middleware
 *
 * Replaces the default loggerLink with enhanced logging
 */
export function createTrpcLoggerLink<
  TRouter extends AnyRouter,
>(): TRPCLink<TRouter> {
  return loggerLink({
    enabled: (opts) => {
      // Always log errors
      if (opts.direction === "down" && opts.result instanceof Error) {
        return true;
      }
      // Log all operations in development, or when explicitly enabled
      return (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV !== "production"
      );
    },
    // Use default console logger on client - server-side logging is handled in middleware
  });
}
