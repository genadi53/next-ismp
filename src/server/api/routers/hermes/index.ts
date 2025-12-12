import { createTRPCRouter } from "@/server/api/trpc";
import { operatorsRouter } from "./operators";
import { equipmentsRouter } from "./equipments";
import { workcardsRouter } from "./workcards";
import { zarabotkiRouter } from "./zarabotki";

export const hermesRouter = createTRPCRouter({
  operators: operatorsRouter,
  equipments: equipmentsRouter,
  workcards: workcardsRouter,
  zarabotki: zarabotkiRouter,
});
