import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { logError } from "@/lib/logger/logger";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({ path, error, input, ctx }) => {
      // Log all tRPC errors (both development and production)
      logError(`[tRPC Route] Failed on ${path ?? "<no-path>"}`, error, {
        path,
        input: input ? JSON.stringify(input) : undefined,
        user: ctx?.user?.username,
      });
    },
  });

export { handler as GET, handler as POST };
