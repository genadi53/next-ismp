import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getPrestartLocations,
  getPrestartLocks,
} from "@/server/repositories/prestart/locations.repository";

export const locationsRouter = createTRPCRouter({
  /**
   * Get all prestart locations.
   */
  getAll: publicProcedure.query(async () => {
    return getPrestartLocations();
  }),

  /**
   * Get prestart locks.
   */
  getLocks: publicProcedure.query(async () => {
    return getPrestartLocks();
  }),
});

