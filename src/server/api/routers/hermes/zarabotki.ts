import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getZarabotki, createZarabotki } from "@/server/repositories";
import { createZarabotkiSchema } from "@/schemas/hermes.schemas";

export const zarabotkiRouter = createTRPCRouter({
  /**
   * Get zarabotki for a specific year and month
   * Defaults to previous month if not specified
   */
  get: protectedProcedure
    .input(
      z
        .object({
          year: z.number().optional(),
          month: z.number().min(1).max(12).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return getZarabotki(input?.year, input?.month);
    }),

  /**
   * Replace zarabotki data for a specific year and month
   * Deletes existing data and inserts new data
   */
  replace: protectedProcedure
    .input(z.array(createZarabotkiSchema).min(1, "Data list cannot be empty"))
    .mutation(async ({ input }) => {
      await createZarabotki(input);
      return { success: true, message: "Zarabotki data replaced successfully" };
    }),
});
