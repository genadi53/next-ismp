import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getAllWorkcards,
  getWorkcardById,
  getWorkcardNotes,
  getWorkcardDetails,
  createWorkcard,
  deleteWorkcard,
  updateWorkcard,
} from "@/server/repositories";
import { createWorkcardSchema } from "@/schemas/hermes.schemas";

export const workcardsRouter = createTRPCRouter({
  /**
   * Get all workcards
   */
  getAll: protectedProcedure.query(async () => {
    return getAllWorkcards();
  }),

  /**
   * Get workcard by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getWorkcardById(input.id);
    }),

  /**
   * Get all unique workcard notes
   */
  getNotes: protectedProcedure.query(async () => {
    return getWorkcardNotes();
  }),

  /**
   * Get workcard details (notes, operators, equipments) for form dropdowns
   */
  getDetails: protectedProcedure.query(async () => {
    return getWorkcardDetails();
  }),

  /**
   * Create a new workcard
   */
  create: protectedProcedure
    .input(createWorkcardSchema)
    .mutation(async ({ input }) => {
      await createWorkcard(input);
      return { success: true, message: "Workcard created successfully" };
    }),

  /**
   * Delete a workcard
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteWorkcard(input.id);
      return { success: true, message: "Workcard deleted successfully" };
    }),

  /**
   * Update an existing workcard
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: createWorkcardSchema }))
    .mutation(async ({ input }) => {
      await updateWorkcard(input.id, input.data);
      return { success: true, message: "Workcard updated successfully" };
    }),
});
