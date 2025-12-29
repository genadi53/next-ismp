import { createTRPCRouter } from "@/server/api/trpc";
import { blendRouter } from "./blend";
import { productionRouter } from "./production";
import { trucksRouter } from "./trucks";
import { excavatorsRouter } from "./excavators";
import { dispatcherRouter } from "./dispatcher";

export const dashboardRouter = createTRPCRouter({
  blend: blendRouter,
  production: productionRouter,
  trucks: trucksRouter,
  excavators: excavatorsRouter,
  dispatcher: dispatcherRouter,
});

