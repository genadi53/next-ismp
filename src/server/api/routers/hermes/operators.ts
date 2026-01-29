import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getAllOperators,
  getOperatorById,
  getOperatorNames,
  createOperator,
  updateOperator,
  deleteOperator,
} from "@/server/repositories";
import { createOperatorSchema } from "@/schemas/hermes.schemas";

export const operatorsRouter = createTRPCRouter({
  /**
   * Get all operators
   */
  getAll: protectedProcedure.query(async () => {
    return getAllOperators();
  }),

  /**
   * Get operator by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getOperatorById(input.id);
    }),

  /**
   * Get operators formatted for dropdown/select lists
   */
  getNames: protectedProcedure.query(async () => {
    return getOperatorNames();
  }),

  /**
   * Create a new operator
   */
  create: protectedProcedure
    .input(createOperatorSchema)
    .mutation(async ({ input }) => {
      await createOperator(input);
      return { success: true, message: "Operator created successfully" };
    }),

  /**
   * Update an existing operator
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: createOperatorSchema }))
    .mutation(async ({ input }) => {
      await updateOperator(input.id, input.data);
      return { success: true, message: "Operator updated successfully" };
    }),

  /**
   * Delete an operator
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteOperator(input.id);
      return { success: true, message: "Operator deleted successfully" };
    }),
});
