/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { logError, logInfo } from "@/lib/logger/logger";
import { fixEncoding } from "@/lib/utf-decoder";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const username = opts.headers.get("X-WEBAUTH-USER") ?? "";
  const fullName = (opts.headers.get("X-Authorize-Name") ?? "").trim() || "";
  const nameBg = (opts.headers.get("X-Authorize-Name-BG") ?? "").trim() || "";
  const email = username
    ? username.concat("@ellatzite-med.com")
    : "test@testov";

  return {
    ...opts,
    user: username
      ? { email, username, fullName, nameBg: fixEncoding(nameBg) }
      : null,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error, ctx, path, input }) {
    // Log all tRPC errors
    logError(`[tRPC] Error in ${path ?? "unknown"}`, error, {
      path,
      code: shape.data.code,
      httpStatus: shape.data.httpStatus,
      input: input ? JSON.stringify(input) : undefined,
      user: ctx?.user?.username,
    });

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(
  async ({ next, path, ctx, type, input }) => {
    const start = Date.now();

    if (t._config.isDev) {
      // artificial delay in dev
      const waitMs = Math.floor(Math.random() * 400) + 100;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    const end = Date.now();
    const duration = end - start;

    // Log all tRPC procedure calls
    logInfo(`[tRPC] ${type.toUpperCase()} ${path}`, {
      path,
      type,
      duration,
      user: ctx.user?.username,
      input: input ? JSON.stringify(input) : undefined,
    });

    return result;
  },
);

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Authorization middleware
 *
 * This middleware checks if a user is authenticated by verifying the user exists in the context.
 * If no user is found, it throws an UNAUTHORIZED error.
 */
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error("UNAUTHORIZED: No user found in request headers");
  }

  return next({
    ctx: {
      // Infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * Use this procedure for any API endpoints that require authentication.
 * It guarantees that ctx.user is defined and non-null.
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(authMiddleware);
