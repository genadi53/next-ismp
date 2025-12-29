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

const createPermissionSchema = z.object({
  Username: z.string(),
  main_menu: z.string(),
  main_menuName: z.string(),
  submenu: z.string().nullable(),
  submenuName: z.string().nullable(),
  action: z.string(),
  ordermenu: z.number().nullable(),
  specialPermisions: z.string().nullable(),
  DMAAdmins: z.string().nullable(),
  Active: z.number().nullable(),
  IsDispatcher: z.number().nullable(),
  Departmant: z.string().nullable(),
  ro: z.string().nullable(),
});

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
    .input(z.array(createPermissionSchema))
    .mutation(async ({ input }) => {
      await createPermissions(input);
      return { success: true, message: "Permissions created successfully" };
    }),

  /**
   * Remove/deactivate a permission.
   */
  remove: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deactivatePermission(input.id);
      return { success: true, message: "Permission removed successfully" };
    }),
});
