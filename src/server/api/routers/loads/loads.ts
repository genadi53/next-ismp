import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getLoads,
  getUnsentLoads,
  createLoad,
  markLoadSent,
  updateLoad,
} from "@/server/repositories/loads/loads.repository";
import { loadsSchema } from "@/schemas/loads.schemas";
import { nameInput } from "@/lib/username";
import { sendEmail } from "@/lib/email/sendEmail";
import { buildLoadsReportHtml } from "@/lib/email/loadsEmailTemplate";
import { env } from "@/env";

export const loadsRouter = createTRPCRouter({
  /**
   * Get all loads from the last 6 months.
   */
  getAll: protectedProcedure.query(async () => {
    return getLoads();
  }),

  /**
   * Get unsent loads.
   */
  getUnsent: protectedProcedure.query(async () => {
    return getUnsentLoads();
  }),

  /**
   * Create a new load entry.
   */
  create: protectedProcedure
    .input(loadsSchema)
    .mutation(async ({ input, ctx }) => {
      await createLoad({
        ...input,
        userAdded: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Load created successfully" };
    }),

  /**
   * Mark a load as sent.
   */
  markSent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markLoadSent(input.id);
      return { success: true, message: "Load marked as sent" };
    }),

  /**
   * Mark all unsent loads as sent.
   */
  sendAll: protectedProcedure.mutation(async () => {
    try {
      const unsentLoads = await getUnsentLoads();

      if (unsentLoads.length === 0) {
        return {
          success: true,
          message: "Няма неизпратени курсове",
          count: 0,
        };
      }

      const htmlTemplate = buildLoadsReportHtml(unsentLoads);
      const messageId = await sendEmail(
        "Отчет редакция курсове",
        htmlTemplate,
        env.TEST_EMAIL_TO ??
          "genadi.tsolov@ellatzite-med.com;p.penkov@ellatzite-med.com;",
      );

      if (!messageId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Неуспешно изпращане на имейл",
        });
      }

      for (const load of unsentLoads) {
        await markLoadSent(load.id);
      }

      return {
        success: true,
        message: `${unsentLoads.length} курса са изпратени успешно`,
        count: unsentLoads.length,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "Грешка при изпращане",
      });
    }
  }),

  /**
   * Update a load entry.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: loadsSchema }))
    .mutation(async ({ input, ctx }) => {
      await updateLoad(input.id, {
        ...input.data,
        userAdded: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Load updated successfully" };
    }),
});
