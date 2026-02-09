import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createMailGroup,
  deleteMailGroup,
  getMailGroupNames,
  getMailGroups,
  updateMailGroup,
} from "@/server/repositories/admin/mail-group.repository";
import { mailGroupSchema } from "@/schemas/admin.schemas";

export const mailGroupsRouter = createTRPCRouter({
  /**
   * Get all mail groups.
   */
  getAll: protectedProcedure.query(async () => {
    return getMailGroups();
  }),

  /**
   * Get all mail group names.
   */
  getNames: protectedProcedure.query(async () => {
    return getMailGroupNames();
  }),

  /**
   * Create a new mail group.
   */
  create: protectedProcedure
    .input(mailGroupSchema)
    .mutation(async ({ input }) => {
      await createMailGroup(input);
      return { success: true, message: "Mail group created successfully" };
    }),

  /**
   * Update an existing mail group.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: mailGroupSchema }))
    .mutation(async ({ input }) => {
      await updateMailGroup(input.id, input.data);
      return { success: true, message: "Mail group updated successfully" };
    }),

  /**
   * Delete a mail group.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteMailGroup(input.id);
      return { success: true, message: "Mail group deleted successfully" };
    }),
});
