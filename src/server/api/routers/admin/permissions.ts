import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  createPermissions,
  deactivatePermission,
  getPermissionUsers,
  getPermissions,
  getPermissionsByUser,
  updatePermission,
} from "@/server/repositories/admin/permissions.repository";

export const permissionsRouter = createTRPCRouter({
  /**
   * Get all permissions, optionally filtered by username prefix.
   */
  getAll: publicProcedure
    .input(z.object({ username: z.string().optional() }))
    .query(async ({ input }) => {
      return getPermissions(input.username);
    }),

  /**
   * Get permissions for a specific user and main menu.
   */
  getForUser: publicProcedure
    .input(z.object({ username: z.string(), mainMenu: z.string() }))
    .query(async ({ input }) => {
      return getPermissionsByUser(input.username, input.mainMenu);
    }),
});
