import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getRoads } from "@/server/repositories/prestart/roads.repository";

export const roadsRouter = createTRPCRouter({
  /**
   * Get all roads/travel paths.
   */
  getAll: protectedProcedure.query(async () => {
    return getRoads();
  }),
});
