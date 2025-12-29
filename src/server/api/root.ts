import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { hermesRouter } from "./routers/hermes";
import { adminRouter } from "./routers/admin";
import { dashboardRouter } from "./routers/dashboard";
import { dmaRouter } from "./routers/dma";
import { dispatcherRouter } from "./routers/dispatcher";
import { loadsRouter } from "./routers/loads";
import { ismpRouter } from "./routers/ismp";
import { prestartRouter } from "./routers/prestart";
import { reportsRouter } from "./routers/reports";
import { geowlanRouter } from "./routers/geowlan";
import { minePlanningRouter } from "./routers/mine-planning";
import { pvrRouter } from "./routers/pvr";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  hermes: hermesRouter,
  admin: adminRouter,
  dashboard: dashboardRouter,
  dma: dmaRouter,
  dispatcher: dispatcherRouter,
  loads: loadsRouter,
  ismp: ismpRouter,
  prestart: prestartRouter,
  reports: reportsRouter,
  geowlan: geowlanRouter,
  minePlanning: minePlanningRouter,
  pvr: pvrRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
