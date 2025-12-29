import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getProductionPlan,
  getExcavProductionDetailed,
  getExcavVol,
} from "@/server/repositories/dashboard/production.repository";

export const productionRouter = createTRPCRouter({
  /**
   * Get production plan data for the current shift day.
   */
  getPlan: publicProcedure.query(async () => {
    return getProductionPlan();
  }),

  /**
   * Get detailed excavator production data for the current shift.
   */
  getExcavDetailed: publicProcedure.query(async () => {
    return getExcavProductionDetailed();
  }),

  /**
   * Get excavator volume data for the current shift.
   */
  getExcavVol: publicProcedure.query(async () => {
    return getExcavVol();
  }),
});

