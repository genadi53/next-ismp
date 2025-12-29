import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getPrestartTrucks,
  getPrestartExcavators,
  getPrestartShovels,
} from "@/server/repositories/prestart/equipment.repository";

export const equipmentRouter = createTRPCRouter({
  /**
   * Get all trucks for prestart checklist.
   */
  getTrucks: publicProcedure.query(async () => {
    return getPrestartTrucks();
  }),

  /**
   * Get all excavators for prestart checklist.
   */
  getExcavators: publicProcedure.query(async () => {
    return getPrestartExcavators();
  }),

  /**
   * Get all shovels for prestart checklist with detailed info.
   */
  getShovels: publicProcedure.query(async () => {
    return getPrestartShovels();
  }),
});

