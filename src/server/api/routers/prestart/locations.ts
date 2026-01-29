import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getPrestartLocations,
  getPrestartLocks,
} from "@/server/repositories/prestart/locations.repository";

export const locationsRouter = createTRPCRouter({
  /**
   * Get all prestart locations.
   */
  getAll: protectedProcedure.query(async () => {
    return getPrestartLocations();
  }),

  /**
   * Get prestart locks.
   */
  getLocks: protectedProcedure.query(async () => {
    return getPrestartLocks();
  }),
});
