import { createTRPCRouter } from "@/server/api/trpc";
import { geowlanSubRouter } from "./geowlan";

export const geowlanRouter = createTRPCRouter({
  aps: geowlanSubRouter,
});

