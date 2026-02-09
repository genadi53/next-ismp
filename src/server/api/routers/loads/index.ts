import { createTRPCRouter } from "@/server/api/trpc";
import { loadsRouter as loadsSubRouter } from "./loads";

export const loadsRouter = createTRPCRouter({
  loads: loadsSubRouter,
});

