import { createTRPCRouter } from "@/server/api/trpc";
import { permissionsRouter } from "./permissions";
import { mailGroupsRouter } from "./mail-groups";

export const adminRouter = createTRPCRouter({
  permissions: permissionsRouter,
  mailGroups: mailGroupsRouter,
});
