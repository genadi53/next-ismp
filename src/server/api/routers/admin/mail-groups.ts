import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  createMailGroup,
  deleteMailGroup,
  getMailGroupNames,
  getMailGroups,
  updateMailGroup,
} from "@/server/repositories/admin/mail-group.repository";

export const mailGroupsRouter = createTRPCRouter({
  /**
   * Get all mail group names.
   */
  getNames: publicProcedure.query(async () => {
    return getMailGroupNames();
  }),
});
