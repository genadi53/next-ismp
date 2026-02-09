import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
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
  getAll: protectedProcedure.query(async () => {
    return getAllEquipments();
  }),

  /**
   * Get equipment by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getEquipmentById(input.id);
    }),

  /**
   * Get equipment names formatted for dropdown/select lists
   */
  getNames: protectedProcedure.query(async () => {
    return getEquipmentNames();
  }),

  /**
   * Create a new equipment
   */
  create: protectedProcedure
    .input(createEquipmentSchema)
    .mutation(async ({ input }) => {
      await createEquipment(input);
      return { success: true, message: "Equipment created successfully" };
    }),

  /**
   * Update an existing equipment
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: createEquipmentSchema }))
    .mutation(async ({ input }) => {
      await updateEquipment(input.id, input.data);
      return { success: true, message: "Equipment updated successfully" };
    }),

  /**
   * Delete an equipment
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteEquipment(input.id);
      return { success: true, message: "Equipment deleted successfully" };
    }),
});
