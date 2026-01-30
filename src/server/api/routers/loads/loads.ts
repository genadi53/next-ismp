import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getLoads,
  getUnsentLoads,
  createLoad,
  markLoadSent,
  updateLoad,
} from "@/server/repositories/loads/loads.repository";
import { loadsSchema } from "@/schemas/loads.schemas";
import { nameInput } from "@/lib/username";

export const loadsRouter = createTRPCRouter({
  /**
   * Get all loads from the last 6 months.
   */
  getAll: protectedProcedure.query(async () => {
    return getLoads();
  }),

  /**
   * Get unsent loads.
   */
  getUnsent: protectedProcedure.query(async () => {
    return getUnsentLoads();
  }),

  /**
   * Create a new load entry.
   */
  create: protectedProcedure
    .input(loadsSchema)
    .mutation(async ({ input, ctx }) => {
      await createLoad({
        ...input,
        userAdded: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Load created successfully" };
    }),

  /**
   * Mark a load as sent.
   */
  markSent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markLoadSent(input.id);
      return { success: true, message: "Load marked as sent" };
    }),

  /**
   * Mark all unsent loads as sent.
   */
  sendAll: protectedProcedure.mutation(async () => {
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
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: loadsSchema }))
    .mutation(async ({ input, ctx }) => {
      await updateLoad(input.id, {
        ...input.data,
        userAdded: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Load updated successfully" };
    }),
});
