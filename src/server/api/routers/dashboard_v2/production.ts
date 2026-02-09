import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getCurrentProduction } from "@/server/repositories/dashboard_v2/production.repository";

export const productionRouter = createTRPCRouter({
  /**
   * Get current production data for the given shift range.
   */
  getCurrentProduction: publicProcedure
    .input(
      z.object({
        startShiftId: z.number(),
        endShiftId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      return getCurrentProduction(input.startShiftId, input.endShiftId);
    }),
});
