import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getNetworkLogs } from "@/server/repositories/ismp/logs.repository";

export const logsRouter = createTRPCRouter({
  /**
   * Get all network action logs.
   */
  getAll: protectedProcedure.query(async () => {
    return getNetworkLogs();
  }),
});
