import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getGeowlanAPs,
  createGeowlanAP,
  updateGeowlanAP,
  deleteGeowlanAP,
} from "@/server/repositories/geowlan/geowlan.repository";

const createGeowlanAPSchema = z.object({
  name: z.string(),
  x: z.number().nullable(),
  y: z.number().nullable(),
  enabled: z.boolean().nullable(),
  mac: z.string().nullable(),
  ip: z.string().nullable(),
  hardware: z.string().nullable(),
  LAN: z.string().nullable(),
  rgb: z.string().nullable().default(null),
});

const updateGeowlanAPSchema = z.object({
  name: z.string(),
  x: z.number(),
  y: z.number(),
  enabled: z.boolean(),
  apId: z.number().nullable(),
  mac: z.string().nullable(),
  ip: z.string().nullable(),
  hardware: z.string().nullable(),
  LAN: z.string().nullable(),
  rgb: z.string().nullable(),
});

export const geowlanSubRouter = createTRPCRouter({
  /**
   * Get all geowlan access points with mast information.
   */
  getAll: protectedProcedure.query(async () => {
    return getGeowlanAPs();
  }),

  /**
   * Create a new geowlan access point with associated mast.
   */
  create: protectedProcedure
    .input(createGeowlanAPSchema)
    .mutation(async ({ input }) => {
      const result = await createGeowlanAP(input);
      return {
        success: true,
        mastId: result.mastId,
        message: "Geowlan AP created successfully",
      };
    }),

  /**
   * Update an existing geowlan access point and mast.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: updateGeowlanAPSchema }))
    .mutation(async ({ input }) => {
      await updateGeowlanAP(input.id, input.data);
      return { success: true, message: "Geowlan AP updated successfully" };
    }),

  /**
   * Delete a geowlan access point (mast).
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteGeowlanAP(input.id);
      return { success: true, message: "Geowlan AP deleted successfully" };
    }),
});
