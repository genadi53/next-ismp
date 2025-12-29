import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getMonthChecklist,
  createMonthChecklistTasks,
} from "@/server/repositories/ismp/checklist.repository";

const createChecklistTaskSchema = z.object({
  YearMonth: z.number(),
  Task: z.string(),
  FinishedBy: z.string().nullable(),
});

export const checklistRouter = createTRPCRouter({
  /**
   * Get month checklist for a specific year/month.
   */
  getByMonth: publicProcedure
    .input(z.object({ yearMonth: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return getMonthChecklist(input?.yearMonth);
    }),

  /**
   * Create month checklist tasks.
   */
  create: publicProcedure
    .input(z.array(createChecklistTaskSchema))
    .mutation(async ({ input }) => {
      await createMonthChecklistTasks(input);
      return { success: true, message: "Checklist tasks created successfully" };
    }),
});

