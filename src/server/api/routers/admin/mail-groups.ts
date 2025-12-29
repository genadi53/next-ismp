import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  createMailGroup,
  deleteMailGroup,
  getMailGroupNames,
  getMailGroups,
  updateMailGroup,
} from "@/server/repositories/admin/mail-group.repository";

const createMailGroupSchema = z.object({
  module: z.string(),
  action: z.string(),
  mail_group_name: z.string(),
  mail_group: z.string(),
});

const updateMailGroupSchema = z.object({
  module: z.string(),
  action: z.string(),
  mail_group_name: z.string(),
  mail_group: z.string(),
});

export const mailGroupsRouter = createTRPCRouter({
  /**
   * Get all mail groups.
   */
  getAll: publicProcedure.query(async () => {
    return getMailGroups();
  }),

  /**
   * Get all mail group names.
   */
  getNames: publicProcedure.query(async () => {
    return getMailGroupNames();
  }),

  /**
   * Create a new mail group.
   */
  create: publicProcedure
    .input(createMailGroupSchema)
    .mutation(async ({ input }) => {
      await createMailGroup(input);
      return { success: true, message: "Mail group created successfully" };
    }),

  /**
   * Update an existing mail group.
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: updateMailGroupSchema }))
    .mutation(async ({ input }) => {
      await updateMailGroup(input.id, input.data);
      return { success: true, message: "Mail group updated successfully" };
    }),

  /**
   * Delete a mail group.
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteMailGroup(input.id);
      return { success: true, message: "Mail group deleted successfully" };
    }),
});
