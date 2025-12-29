import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getNetworkLogs } from "@/server/repositories/ismp/logs.repository";

export const logsRouter = createTRPCRouter({
  /**
   * Get all network action logs.
   */
  getAll: publicProcedure.query(async () => {
    return getNetworkLogs();
  }),
});

