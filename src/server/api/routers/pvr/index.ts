import { createTRPCRouter } from "@/server/api/trpc";
import { blastingPlanRouter } from "./blasting-plan";
import { gasRouter } from "./gas";
import { raportRouter } from "./raport";

export const pvrRouter = createTRPCRouter({
  blastingPlan: blastingPlanRouter,
  gas: gasRouter,
  raport: raportRouter,
});

