import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getAllOperators,
  getOperatorById,
  getOperatorNames,
  createOperator,
  updateOperator,
  deleteOperator,
} from "@/server/repositories";
import {
  createOperatorSchema,
  updateOperatorSchema,
} from "@/schemas/hermes.schemas";

export const operatorsRouter = createTRPCRouter({
  /**
   * Get all operators
   */
  getAll: publicProcedure.query(async () => {
    return getAllOperators();
  }),

  /**
   * Get operator by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getOperatorById(input.id);
    }),

  /**
   * Get operators formatted for dropdown/select lists
   */
  getNames: publicProcedure.query(async () => {
    return getOperatorNames();
  }),

  /**
   * Create a new operator
   */
  create: publicProcedure
    .input(createOperatorSchema)
    .mutation(async ({ input }) => {
      await createOperator(input);
      return { success: true, message: "Operator created successfully" };
    }),

  /**
   * Update an existing operator
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: updateOperatorSchema }))
    .mutation(async ({ input }) => {
      await updateOperator(input.id, input.data);
      return { success: true, message: "Operator updated successfully" };
    }),

  /**
   * Delete an operator
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteOperator(input.id);
      return { success: true, message: "Operator deleted successfully" };
    }),
});
