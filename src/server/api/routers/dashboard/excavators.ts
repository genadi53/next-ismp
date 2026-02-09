import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  countExcavRegion,
  totalSumExcavs,
  hourCountExcav,
  hourProdExcav,
} from "@/server/repositories/dashboard/excavators.repository";

export const excavatorsRouter = createTRPCRouter({
  /**
   * Get excavator count by region for the current shift.
   */
  countByRegion: publicProcedure.query(async () => {
    return countExcavRegion();
  }),

  /**
   * Get total sum of excavators by status.
   */
  totalSum: publicProcedure.query(async () => {
    return totalSumExcavs();
  }),

  /**
   * Get hourly excavator count for the current shift.
   */
  hourlyCount: publicProcedure.query(async () => {
    return hourCountExcav();
  }),

  /**
   * Get hourly excavator production for the current shift.
   */
  hourlyProduction: publicProcedure.query(async () => {
    return hourProdExcav();
  }),
});

