import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getPrestartStatus,
  getCurrentPrestartCheck,
  createPrestartCheck,
  completeOldPrestartChecks,
  endPrestartCheck,
  getCurrentShiftId,
} from "@/server/repositories/dispatcher/prestart.repository";
import {
  createPrestartCheckSchema,
  completePrestartCheckSchema,
} from "@/schemas/dispatcher.schemas";

export const prestartRouter = createTRPCRouter({
  /**
   * Get prestart status for a dispatcher.
   */
  getStatus: publicProcedure
    .input(z.object({ dispatcher: z.string() }))
    .query(async ({ input }) => {
      return getPrestartStatus(input.dispatcher);
    }),

  /**
   * Get current prestart check for a dispatcher.
   */
  getCurrent: publicProcedure
    .input(z.object({ dispatcher: z.string() }))
    .query(async ({ input }) => {
      return getCurrentPrestartCheck(input.dispatcher);
    }),

  /**
   * Start a new prestart check.
   */
  start: publicProcedure
    .input(createPrestartCheckSchema)
    .mutation(async ({ input }) => {
      const shiftId = await getCurrentShiftId();
      const newPrestartId = await createPrestartCheck({
        ...input,
        Shift: shiftId,
      });
      return {
        success: true,
        message: "Prestart check started successfully",
        id: newPrestartId,
      };
    }),

  /**
   * End a specific prestart check.
   */
  end: publicProcedure
    .input(z.object({ id: z.number(), data: completePrestartCheckSchema }))
    .mutation(async ({ input }) => {
      await endPrestartCheck(input.id, input.data);
      return {
        success: true,
        message: "Prestart check ended successfully",
      };
    }),

  /**
   * Complete all old unfinished prestart checks.
   */
  completeOld: publicProcedure
    .input(completePrestartCheckSchema)
    .mutation(async ({ input }) => {
      await completeOldPrestartChecks(input);
      return {
        success: true,
        message: "Old prestart checks completed successfully",
      };
    }),

  /**
   * Get current shift ID.
   */
  getCurrentShift: publicProcedure.query(async () => {
    return getCurrentShiftId();
  }),
});

