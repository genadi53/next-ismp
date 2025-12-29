import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getMonthPlanOperativen,
  createMonthPlanOperativen,
} from "@/server/repositories/mine-planning/operativen-plan.repository";

const createPlanOperativenSchema = z.object({
  PlanMonthDay: z.string(),
  Object: z.string(),
  PlanVolOre: z.number().nullable(),
  PlanMassOre: z.number().nullable(),
  PlanVolOreKet: z.number().nullable(),
  PlanmassOreKet: z.number().nullable(),
  PlanOreFromDepoVol: z.number().nullable(),
  PlanOreFromDepoMass: z.number().nullable(),
  PlanIBRDepoVol: z.number().nullable(),
  PlanIBRDepoMass: z.number().nullable(),
  PlanIBRFROMDepoVol: z.number().nullable(),
  PlanIBRFROMDepoMass: z.number().nullable(),
  PlanVolWaste: z.number().nullable(),
  PlanMassWaste: z.number().nullable(),
  PlanTkm: z.number().nullable(),
  PlanTkmTruckDay: z.number().nullable(),
  percent_ore_KET: z.number().nullable(),
  Cu_t_KET: z.number().nullable(),
  percent_ore: z.number().nullable(),
  Cu_t: z.number().nullable(),
  percent_oreFromDepo: z.number().nullable(),
  Cu_t_FromDepo: z.number().nullable(),
  Cu_t_IBRFromDepo: z.number().nullable(),
  percent_IBRFromDepo: z.number().nullable(),
  PlanVolOreMasiv: z.number().nullable(),
  PlanMassOreMasiv: z.number().nullable(),
  PlanVolOreProsip: z.number().nullable(),
  PlanMassOreProsip: z.number().nullable(),
  PlanOreDepoVol: z.number().nullable(),
  PlanOreDepoMass: z.number().nullable(),
  PlanVolWasteProsip: z.number().nullable(),
  PlanMassWasteProsip: z.number().nullable(),
  percent_oreMasiv: z.number().nullable(),
  Cu_t_Masiv: z.number().nullable(),
  percent_oreProsip: z.number().nullable(),
  Cu_t_Prosip: z.number().nullable(),
  percent_oreDepo: z.number().nullable(),
  Cu_t_Depo: z.number().nullable(),
  PlanVolIBRToDepo: z.number().nullable(),
  PlanMassIBRToDepo: z.number().nullable(),
  percent_IBRToDepo: z.number().nullable(),
  Cu_t_IBRToDepo: z.number().nullable(),
  userAdded: z.string().nullable(),
});

export const operativenPlanRouter = createTRPCRouter({
  /**
   * Get operational plan for the current date.
   */
  getAll: publicProcedure.query(async () => {
    return getMonthPlanOperativen();
  }),

  /**
   * Create operational plan entries.
   */
  create: publicProcedure
    .input(z.array(createPlanOperativenSchema))
    .mutation(async ({ input }) => {
      await createMonthPlanOperativen(input);
      return { success: true, message: "Operational plan created successfully" };
    }),
});

