import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  createPermissions,
  deactivatePermission,
  getPermissionUsers,
  getPermissions,
  getPermissionsByUser,
} from "@/server/repositories/admin/permissions.repository";
import { permissionFormSchema } from "@/schemas/admin.schemas";

export const permissionsRouter = createTRPCRouter({
  /**
   * Get all permissions, optionally filtered by username prefix.
   */
  getAll: publicProcedure
    .input(z.object({ username: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return getPermissions(input?.username);
    }),

  /**
   * Get permissions for a specific user and main menu.
   */
  getForUser: publicProcedure
    .input(z.object({ username: z.string(), mainMenu: z.string() }))
    .query(async ({ input }) => {
      return getPermissionsByUser(input.username, input.mainMenu);
    }),

  /**
   * Get list of distinct usernames with permissions.
   */
  getUsernames: publicProcedure.query(async () => {
    return getPermissionUsers();
  }),

  /**
   * Create permissions.
   */
  create: publicProcedure
    .input(z.array(permissionFormSchema))
    .mutation(async ({ input }) => {
      await createPermissions(input);
      return { success: true, message: "Permissions created successfully" };
    }),

  /**
   * Remove/deactivate a permission.
   */
  remove: publicProcedure
    .input(
      z.object({
        Username: z.string(),
        main_menu: z.string(),
        submenu: z.string().nullable(),
        action: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await deactivatePermission(input);
      return { success: true, message: "Permission removed successfully" };
    }),
});
