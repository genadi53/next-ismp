import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getBlendData } from "@/server/repositories/dashboard/blend.repository";

export const blendRouter = createTRPCRouter({
  /**
   * Get blend data for the current shift.
   */
  getData: publicProcedure.query(async () => {
    return getBlendData();
  }),
});

