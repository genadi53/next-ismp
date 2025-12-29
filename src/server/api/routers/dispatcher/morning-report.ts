import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getMorningReports,
  getMorningReportById,
  getMorningReportTemplate,
  createMorningReport,
  updateMorningReport,
  sendMorningReport,
} from "@/server/repositories/dispatcher/morning-report.repository";

const createMorningReportSchema = z.object({
  ReportDate: z.string(),
  StartedFromDispatcher: z.string(),
  ReportBody: z.string(),
});

const updateMorningReportSchema = z.object({
  CompletedFromDispatcher: z.string().nullable(),
  CompletedOn: z.string().nullable(),
  ReportBody: z.string(),
});

const sendMorningReportSchema = z.object({
  SentOn: z.string(),
  SentFrom: z.string(),
});

export const morningReportRouter = createTRPCRouter({
  /**
   * Get all morning reports.
   */
  getAll: publicProcedure.query(async () => {
    return getMorningReports();
  }),

  /**
   * Get a morning report by ID.
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getMorningReportById(input.id);
    }),

  /**
   * Get the morning report template.
   */
  getTemplate: publicProcedure.query(async () => {
    return getMorningReportTemplate();
  }),

  /**
   * Create a new morning report.
   */
  create: publicProcedure
    .input(createMorningReportSchema)
    .mutation(async ({ input }) => {
      await createMorningReport(input);
      return { success: true, message: "Morning report created successfully" };
    }),

  /**
   * Update an existing morning report.
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: updateMorningReportSchema }))
    .mutation(async ({ input }) => {
      await updateMorningReport(input.id, input.data);
      return { success: true, message: "Morning report updated successfully" };
    }),

  /**
   * Mark a morning report as sent.
   */
  send: publicProcedure
    .input(z.object({ id: z.number(), data: sendMorningReportSchema }))
    .mutation(async ({ input }) => {
      await sendMorningReport(input.id, input.data);
      return { success: true, message: "Morning report sent successfully" };
    }),
});

