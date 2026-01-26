import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getBlastReports,
  createBlastReport,
  updateBlastReport,
} from "@/server/repositories/pvr/raport.repository";

const createBlastReportSchema = z.object({
  ShiftDate: z.string().nullable(),
  VP_num: z.string().nullable(),
  Horiz: z.string().nullable(),
  site_conditon: z.string().nullable(),
  quality_do_1m: z.string().nullable(),
  quality_nad_1m: z.string().nullable(),
  quality_zone_prosip: z.string().nullable(),
  water_presence_drilling: z.string().nullable(),
  water_presence_fueling: z.string().nullable(),
  E3400: z.number().nullable(),
  ANFO: z.number().nullable(),
  E1100: z.number().nullable(),
  non_retaining: z.number().nullable(),
  quality_explosive: z.string().nullable(),
  quality_zatapka: z.string().nullable(),
  smoke_presence: z.string().nullable(),
  scattering: z.string().nullable(),
  presence_negabarit: z.string().nullable(),
  state_blast_material: z.string().nullable(),
  state_blast_site_after: z.string().nullable(),
  non_blasted_num: z.number().nullable(),
  Initiate: z.string().nullable(),
  CreatedFrom: z.string().nullable().default(null),
  EditedFrom: z.string().nullable().default(null),
});

const updateBlastReportSchema = createBlastReportSchema.omit({
  CreatedFrom: true,
  EditedFrom: true,
});

export const raportRouter = createTRPCRouter({
  /**
   * Get all blast reports.
   */
  getAll: publicProcedure.query(async () => {
    return getBlastReports();
  }),

  /**
   * Create a new blast report.
   */
  create: publicProcedure
    .input(createBlastReportSchema)
    .mutation(async ({ input }) => {
      await createBlastReport(input);
      return { success: true, message: "Blast report created successfully" };
    }),

  /**
   * Update an existing blast report.
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: updateBlastReportSchema }))
    .mutation(async ({ input }) => {
      await updateBlastReport(input.id, input.data);
      return { success: true, message: "Blast report updated successfully" };
    }),
});
