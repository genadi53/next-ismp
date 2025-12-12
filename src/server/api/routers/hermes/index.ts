import { createTRPCRouter } from "@/server/api/trpc";
import { operatorsRouter } from "./operators";

export const hermesRouter = createTRPCRouter({
  operators: operatorsRouter,
  // Add more sub-routers here as they are created:
  // equipments: equipmentsRouter,
  // workcards: workcardsRouter,
  // zarabotki: zarabotkiRouter,
});
