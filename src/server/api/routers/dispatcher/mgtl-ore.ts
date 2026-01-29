import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getMgtlOre,
  createMgtlOre,
  updateMgtlOre,
} from "@/server/repositories/dispatcher/mgtl-ore.repository";

const createMgtlOreSchema = z.object({
  OperDate: z.string(),
  Izvoz1: z.number().nullable(),
  Mgtl1: z.number().nullable(),
  Izvoz3: z.number().nullable(),
  Mgtl3: z.number().nullable(),
  Izvoz4: z.number().nullable(),
  Mgtl4: z.number().nullable(),
});

const updateMgtlOreSchema = z.object({
  Izvoz1: z.number().nullable(),
  Mgtl1: z.number().nullable(),
  Izvoz3: z.number().nullable(),
  Mgtl3: z.number().nullable(),
  Izvoz4: z.number().nullable(),
  Mgtl4: z.number().nullable(),
});

export const mgtlOreRouter = createTRPCRouter({
  /**
   * Get MGTL ore export data for the last 2 months.
   */
  getAll: protectedProcedure.query(async () => {
    return getMgtlOre();
  }),

  /**
   * Create a new MGTL ore entry.
   */
  create: protectedProcedure
    .input(createMgtlOreSchema)
    .mutation(async ({ input }) => {
      await createMgtlOre(input);
      return { success: true, message: "MGTL ore entry created successfully" };
    }),

  /**
   * Update an existing MGTL ore entry.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: updateMgtlOreSchema }))
    .mutation(async ({ input }) => {
      await updateMgtlOre(input.id, input.data);
      return { success: true, message: "MGTL ore entry updated successfully" };
    }),
});
