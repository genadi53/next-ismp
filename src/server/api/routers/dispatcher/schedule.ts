import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getDispatcherSchedule,
  createDispatcherSchedule,
} from "@/server/repositories/dispatcher/schedule.repository";

const createScheduleEntrySchema = z.object({
  Date: z.string(),
  Shift: z.number(),
  dispatcherID: z.number(),
  Name: z.string(),
  LoginName: z.string().nullable(),
});

export const scheduleRouter = createTRPCRouter({
  /**
   * Get dispatcher schedule for the current month.
   */
  getAll: publicProcedure.query(async () => {
    return getDispatcherSchedule();
  }),

  /**
   * Create dispatcher schedule for a month.
   */
  create: publicProcedure
    .input(z.array(createScheduleEntrySchema))
    .mutation(async ({ input }) => {
      await createDispatcherSchedule(input);
      return { success: true, message: "Dispatcher schedule created successfully" };
    }),
});

