import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
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
  getAll: protectedProcedure.query(async () => {
    return getMorningReports();
  }),

  /**
   * Get a morning report by ID.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getMorningReportById(input.id);
    }),

  /**
   * Get the morning report template.
   */
  getTemplate: protectedProcedure.query(async () => {
    return getMorningReportTemplate();
  }),

  /**
   * Create a new morning report.
   */
  create: protectedProcedure
    .input(createMorningReportSchema)
    .mutation(async ({ input }) => {
      await createMorningReport(input);
      return { success: true, message: "Morning report created successfully" };
    }),

  /**
   * Update an existing morning report.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: updateMorningReportSchema }))
    .mutation(async ({ input }) => {
      await updateMorningReport(input.id, input.data);
      return { success: true, message: "Morning report updated successfully" };
    }),

  /**
   * Mark a morning report as sent.
   */
  send: protectedProcedure
    .input(z.object({ id: z.number(), data: sendMorningReportSchema }))
    .mutation(async ({ input }) => {
      await sendMorningReport(input.id, input.data);
      return { success: true, message: "Morning report sent successfully" };
    }),
});
