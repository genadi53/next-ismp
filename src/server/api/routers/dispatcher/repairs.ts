import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getExcavatorReasons,
  getDrillReasons,
  getExcavators,
  getRequestRepairs,
  createRequestRepairs,
  markRepairRequestsSent,
} from "@/server/repositories/dispatcher/repairs.repository";

const createRequestRepairSchema = z.object({
  RequestDate: z.string(),
  Equipment: z.string(),
  EquipmentType: z.string().nullable(),
  RequestRemont: z.string().nullable(),
  DrillHoles_type: z.string().nullable(),
});

export const repairsRouter = createTRPCRouter({
  /**
   * Get excavator repair reasons.
   */
  getExcavatorReasons: publicProcedure.query(async () => {
    return getExcavatorReasons();
  }),

  /**
   * Get drill repair reasons.
   */
  getDrillReasons: publicProcedure.query(async () => {
    return getDrillReasons();
  }),

  /**
   * Get all excavators.
   */
  getExcavators: publicProcedure.query(async () => {
    return getExcavators();
  }),

  /**
   * Get repair requests, optionally filtered by date.
   */
  getRequests: publicProcedure
    .input(z.object({ date: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return getRequestRepairs(input?.date);
    }),

  /**
   * Create repair requests.
   */
  createRequests: publicProcedure
    .input(z.array(createRequestRepairSchema))
    .mutation(async ({ input }) => {
      await createRequestRepairs(input);
      return { success: true, message: "Repair requests created successfully" };
    }),

  /**
   * Mark repair requests as sent for a specific date.
   */
  markSent: publicProcedure
    .input(z.object({ date: z.string() }))
    .mutation(async ({ input }) => {
      await markRepairRequestsSent(input.date);
      return { success: true, message: "Repair requests marked as sent" };
    }),
});

