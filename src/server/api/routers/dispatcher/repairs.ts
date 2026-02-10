import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getExcavatorReasons,
  getDrillReasons,
  getExcavators,
  getRequestRepairs,
  createRequestRepairs,
  markRepairRequestsSent,
} from "@/server/repositories/dispatcher/repairs.repository";
import { nameInput } from "@/lib/username";
import { getMailGroupsByName } from "@/server/repositories";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "@/lib/email/sendEmail";
import { buildRepairRequestsEmailTemplate } from "@/lib/email/requestRepairsTemplate";

const createRequestRepairSchema = z.object({
  RequestDate: z.string(),
  Equipment: z.string(),
  EquipmentType: z.string().nullable(),
  RequestRemont: z.string().nullable(),
  DrillHoles_type: z.string().nullable(),
});

export const repairsRouter = createTRPCRouter({
  /**
   * Get excavator repair reasons.
   */
  getExcavatorReasons: protectedProcedure.query(async () => {
    return getExcavatorReasons();
  }),

  /**
   * Get drill repair reasons.
   */
  getDrillReasons: protectedProcedure.query(async () => {
    return getDrillReasons();
  }),

  /**
   * Get all excavators.
   */
  getExcavators: protectedProcedure.query(async () => {
    return getExcavators();
  }),

  /**
   * Get repair requests, optionally filtered by date.
   */
  getRequests: protectedProcedure
    .input(z.object({ date: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return getRequestRepairs(input?.date);
    }),

  /**
   * Create repair requests.
   */
  createRequests: protectedProcedure
    .input(z.array(createRequestRepairSchema))
    .mutation(async ({ input, ctx }) => {
      await createRequestRepairs(
        input.map((repair) => ({
          ...repair,
          userAdded: nameInput(ctx.user.username, ctx.user.nameBg),
        })),
      );
      return { success: true, message: "Repair requests created successfully" };
    }),

  /**
   * Mark repair requests as sent for a specific date.
   */
  markSent: protectedProcedure
    .input(z.object({ date: z.string() }))
    .mutation(async ({ input }) => {
      const mailGroup = await getMailGroupsByName("Отчети"); // Заявки за ремонт

      if (!mailGroup || !mailGroup.mail_group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Няма такава имейл група (Заявки за ремонт).",
        });
      }
      console.log(mailGroup.mail_group);

      const requests = await getRequestRepairs(input.date);
      const htmlTemplate = buildRepairRequestsEmailTemplate(
        requests,
        input.date,
      );
      const messageId = await sendEmail(
        "Заявка за ремонти",
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

      await markRepairRequestsSent(input.date);
      return { success: true, message: "Repair requests marked as sent" };
    }),
});
