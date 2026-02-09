import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
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
  getStatus: protectedProcedure
    .input(z.object({ dispatcher: z.string() }))
    .query(async ({ input }) => {
      return getPrestartStatus(input.dispatcher);
    }),

  /**
   * Get current prestart check for a dispatcher.
   */
  getCurrent: protectedProcedure
    .input(z.object({ dispatcher: z.string() }))
    .query(async ({ input }) => {
      return getCurrentPrestartCheck(input.dispatcher);
    }),

  /**
   * Start a new prestart check.
   */
  start: protectedProcedure
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
  end: protectedProcedure
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
  completeOld: protectedProcedure
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
  getCurrentShift: protectedProcedure.query(async () => {
    return getCurrentShiftId();
  }),
});
