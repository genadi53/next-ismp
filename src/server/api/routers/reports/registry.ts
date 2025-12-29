import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getReportsRegistry,
  createReportsRegistry,
  updateReportsRegistry,
} from "@/server/repositories/reports/registry.repository";

const createRegistrySchema = z.object({
  ReportID: z.number(),
  RequestID: z.string().nullable(),
  RequestDate: z.string(),
  RequestDepartment: z.string().nullable(),
  RequestedFrom: z.string().nullable(),
  RequestDescription: z.string().nullable(),
  ReportFormat: z.string().nullable(),
  VerificationExistsReport: z.boolean().nullable(),
  WorkAcceptedFrom: z.string().nullable(),
  AttachedDocuments: z.string().nullable(),
  CompletedWorkOn: z.string().nullable(),
  CompletedWorkDesc: z.string().nullable(),
  VerificationWorkDesc: z.string().nullable(),
  ApprovedFrom: z.string().nullable(),
});

export const registryRouter = createTRPCRouter({
  /**
   * Get all reports registry entries.
   */
  getAll: publicProcedure.query(async () => {
    return getReportsRegistry();
  }),

  /**
   * Create a new reports registry entry.
   */
  create: publicProcedure
    .input(createRegistrySchema)
    .mutation(async ({ input }) => {
      await createReportsRegistry(input);
      return { success: true, message: "Registry entry created successfully" };
    }),

  /**
   * Update an existing reports registry entry.
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: createRegistrySchema }))
    .mutation(async ({ input }) => {
      await updateReportsRegistry(input.id, input.data);
      return { success: true, message: "Registry entry updated successfully" };
    }),
});

