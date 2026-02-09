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
import { nameInput } from "@/lib/username";
import { TRPCError } from "@trpc/server";
import { getMailGroupsByName } from "@/server/repositories";
import { sendEmail } from "@/lib/email/sendEmail";

const createMorningReportSchema = z.object({
  ReportDate: z.string(),
  ReportBody: z.string(),
});

const updateMorningReportSchema = z.object({
  CompletedOn: z.string().nullable(),
  ReportBody: z.string(),
});

const sendMorningReportSchema = z.object({
  SentOn: z.string(),
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
    .mutation(async ({ input, ctx }) => {
      await createMorningReport({
        ...input,
        StartedFromDispatcher: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Morning report created successfully" };
    }),

  /**
   * Update an existing morning report.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: updateMorningReportSchema }))
    .mutation(async ({ input, ctx }) => {
      await updateMorningReport(input.id, {
        ...input.data,
        CompletedFromDispatcher: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Morning report updated successfully" };
    }),

  /**
   * Mark a morning report as sent.
   */
  send: protectedProcedure
    .input(z.object({ id: z.number(), data: sendMorningReportSchema }))
    .mutation(async ({ input, ctx }) => {
      const mailGroup = await getMailGroupsByName("Отчети"); // Отчет денонощие диспечер

      if (!mailGroup || !mailGroup.mail_group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Няма такава имейл група (Отчет денонощие диспечер).",
        });
      }
      console.log(mailGroup.mail_group);

      const htmlTemplate = "null";
      const messageId = await sendEmail(
        "Отчет редакция курсове",
        htmlTemplate,
        mailGroup.mail_group,
        // env.TEST_EMAIL_TO ??
        //   "genadi.tsolov@ellatzite-med.com;p.penkov@ellatzite-med.com;",
      );

      if (!messageId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Неуспешно изпращане на имейл",
        });
      }

      await sendMorningReport(input.id, {
        ...input.data,
        SentFrom: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Morning report sent successfully" };
    }),
});
