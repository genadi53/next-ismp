import { createTRPCRouter } from "@/server/api/trpc";
import { naturalPlanRouter } from "./natural-plan";
import { operativenPlanRouter } from "./operativen-plan";
import { planShovelsRouter } from "./plan-shovels";

export const minePlanningRouter = createTRPCRouter({
  naturalPlan: naturalPlanRouter,
  operativenPlan: operativenPlanRouter,
  planShovels: planShovelsRouter,
});

