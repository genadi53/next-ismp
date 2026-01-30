import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getMonthPlanNP,
  createMonthPlanNP,
} from "@/server/repositories/mine-planning/natural-plan.repository";
import { nameInput } from "@/lib/username";

const createPlanNPSchema = z.object({
  PlanMonthDay: z.string(),
  PlanType: z.string(),
  Object: z.string(),
  PlanVolOre: z.number().nullable(),
  PlanMassOre: z.number().nullable(),
  percent_ore: z.number().nullable(),
  Cu_t: z.number().nullable(),
  PlanVolOreKet: z.number().nullable(),
  PlanMassOreKet: z.number().nullable(),
  percent_oreKet: z.number().nullable(),
  Cu_t_Ket: z.number().nullable(),
  PlanVolOreFromDepo: z.number().nullable(),
  PlanMassOreFromDepo: z.number().nullable(),
  percent_oreFromDepo: z.number().nullable(),
  Cu_t_FromDepo: z.number().nullable(),
  PlanVolIBRFromDepo: z.number().nullable(),
  PlanMassIBRFromDepo: z.number().nullable(),
  percent_IBRFromDepo: z.number().nullable(),
  Cu_t_IBRFromDepo: z.number().nullable(),
  PlanVolOreDepo: z.number().nullable(),
  PlanMassOreDepo: z.number().nullable(),
  percent_oreDepo: z.number().nullable(),
  Cu_t_Depo: z.number().nullable(),
  PlanVolIBRToDepo: z.number().nullable(),
  PlanMassIBRToDepo: z.number().nullable(),
  percent_IBRToDepo: z.number().nullable(),
  Cu_t_IBRToDepo: z.number().nullable(),
  PlanVolWaste: z.number().nullable(),
  PlanMassWaste: z.number().nullable(),
  PlanVolTot: z.number().nullable(),
  PlanMassTot: z.number().nullable(),
  Planvol: z.number().nullable(),
  PlanMass: z.number().nullable(),
  PlanTkmOre: z.number().nullable(),
  AvgkmOre: z.number().nullable(),
  PlanTkmWaste: z.number().nullable(),
  AvgkmWaste: z.number().nullable(),
  PlanTkm: z.number().nullable(),
  Avgkm: z.number().nullable(),
});

export const naturalPlanRouter = createTRPCRouter({
  /**
   * Get natural plan (НП) for the current date.
   */
  getAll: protectedProcedure.query(async () => {
    return getMonthPlanNP();
  }),

  /**
   * Create natural plan entries.
   */
  create: protectedProcedure
    .input(z.array(createPlanNPSchema))
    .mutation(async ({ input, ctx }) => {
      await createMonthPlanNP(
        input.map((plan) => ({
          ...plan,
          userAdded: nameInput(ctx.user.username, ctx.user.nameBg),
        })),
      );
      return { success: true, message: "Natural plan created successfully" };
    }),
});
