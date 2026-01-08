import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getLoads,
  getUnsentLoads,
  createLoad,
  markLoadSent,
  updateLoad,
} from "@/server/repositories/loads/loads.repository";
import { loadsSchema } from "@/schemas/loads.schemas";

export const loadsRouter = createTRPCRouter({
  /**
   * Get all loads from the last 6 months.
   */
  getAll: publicProcedure.query(async () => {
    return getLoads();
  }),

  /**
   * Get unsent loads.
   */
  getUnsent: publicProcedure.query(async () => {
    return getUnsentLoads();
  }),

  /**
   * Create a new load entry.
   */
  create: publicProcedure.input(loadsSchema).mutation(async ({ input }) => {
    await createLoad(input);
    return { success: true, message: "Load created successfully" };
  }),

  /**
   * Mark a load as sent.
   */
  markSent: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markLoadSent(input.id);
      return { success: true, message: "Load marked as sent" };
    }),

  /**
   * Mark all unsent loads as sent.
   */
  sendAll: publicProcedure.mutation(async () => {
    const unsentLoads = await getUnsentLoads();
    for (const load of unsentLoads) {
      await markLoadSent(load.id);
    }
    return {
      success: true,
      message: `${unsentLoads.length} loads marked as sent`,
      count: unsentLoads.length,
    };
  }),

  /**
   * Update a load entry.
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: loadsSchema }))
    .mutation(async ({ input }) => {
      await updateLoad(input.id, input.data);
      return { success: true, message: "Load updated successfully" };
    }),
});
