import { createTRPCRouter } from "@/server/api/trpc";
import { trucksRouterV2 } from "./trucks";

export const dashboardV2Router = createTRPCRouter({
  trucks: trucksRouterV2,
});
