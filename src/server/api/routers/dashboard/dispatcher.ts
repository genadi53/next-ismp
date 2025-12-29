import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getCurrentDispatcher,
  getDispatchEquipmentNames,
} from "@/server/repositories/dashboard/dispatcher.repository";

export const dispatcherRouter = createTRPCRouter({
  /**
   * Get the current dispatcher information.
   */
  getCurrent: publicProcedure.query(async () => {
    return getCurrentDispatcher();
  }),

  /**
   * Get all equipment names for dispatch selection.
   */
  getEquipmentNames: publicProcedure.query(async () => {
    return getDispatchEquipmentNames();
  }),
});

