import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getMonthPlanShovels,
  createMonthPlanShovels,
} from "@/server/repositories/mine-planning/plan-shovels.repository";
import { nameInput } from "@/lib/username";

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
});

export const planShovelsRouter = createTRPCRouter({
  /**
   * Get shovel plan for the current date.
   */
  getAll: protectedProcedure.query(async () => {
    return getMonthPlanShovels();
  }),

  /**
   * Create shovel plan entries.
   */
  create: protectedProcedure
    .input(z.array(createPlanShovelsSchema))
    .mutation(async ({ input, ctx }) => {
      await createMonthPlanShovels(
        input.map((plan) => ({
          ...plan,
          userAdded: nameInput(ctx.user.username, ctx.user.nameBg),
        })),
      );
      return { success: true, message: "Shovel plan created successfully" };
    }),
});
