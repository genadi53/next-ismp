import { createTRPCRouter } from "@/server/api/trpc";
import { registryRouter } from "./registry";

export const reportsRouter = createTRPCRouter({
  registry: registryRouter,
});

