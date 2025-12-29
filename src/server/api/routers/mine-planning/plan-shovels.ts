import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getMonthPlanShovels,
  createMonthPlanShovels,
} from "@/server/repositories/mine-planning/plan-shovels.repository";

const createPlanShovelsSchema = z.object({
  PlanMonthDay: z.string(),
  Object: z.string(),
  Horizont: z.string().nullable(),
  MMtype: z.string().nullable(),
  Shovel: z.string().nullable(),
  DumpLocation: z.string().nullable().default(null),
  PlanVol: z.number().nullable(),
  PlanMass: z.number().nullable().default(null),
  Etap: z.string().nullable(),
  userAdded: z.string().nullable().default(null),
});

export const planShovelsRouter = createTRPCRouter({
  /**
   * Get shovel plan for the current date.
   */
  getAll: publicProcedure.query(async () => {
    return getMonthPlanShovels();
  }),

  /**
   * Create shovel plan entries.
   */
  create: publicProcedure
    .input(z.array(createPlanShovelsSchema))
    .mutation(async ({ input }) => {
      await createMonthPlanShovels(input);
      return { success: true, message: "Shovel plan created successfully" };
    }),
});

