import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getAllEquipments,
  getEquipmentById,
  getEquipmentNames,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from "@/server/repositories";
import { createEquipmentSchema } from "@/schemas/hermes.schemas";

export const equipmentsRouter = createTRPCRouter({
  /**
   * Get all equipments
   */
  getAll: publicProcedure.query(async () => {
    return getAllEquipments();
  }),

  /**
   * Get equipment by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getEquipmentById(input.id);
    }),

  /**
   * Get equipment names formatted for dropdown/select lists
   */
  getNames: publicProcedure.query(async () => {
    return getEquipmentNames();
  }),

  /**
   * Create a new equipment
   */
  create: publicProcedure
    .input(createEquipmentSchema)
    .mutation(async ({ input }) => {
      await createEquipment(input);
      return { success: true, message: "Equipment created successfully" };
    }),

  /**
   * Update an existing equipment
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: createEquipmentSchema }))
    .mutation(async ({ input }) => {
      await updateEquipment(input.id, input.data);
      return { success: true, message: "Equipment updated successfully" };
    }),

  /**
   * Delete an equipment
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteEquipment(input.id);
      return { success: true, message: "Equipment deleted successfully" };
    }),
});
