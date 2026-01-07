import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getRouterConfig,
  getRouterConfigWithPassword,
  setRouterConfig,
} from "@/server/repositories/ismp/mikrotik.repository";
import { mikrotikService } from "@/server/services/mikrotik.service";
import { routerConfigSchema } from "@/schemas/mikrotik.schemas";

export const mikrotikRouter = createTRPCRouter({
  /**
   * Get user's router configuration.
   * Password is masked for security.
   */
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const config = await getRouterConfig(ctx.user.username);
    return config;
  }),

  /**
   * Save or update router configuration.
   * If password is "••••••••", uses existing password from database.
   */
  setConfig: protectedProcedure
    .input(routerConfigSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate password if not masked
      if (input.password === "••••••••") {
        const existing = await getRouterConfig(ctx.user.username);
        if (!existing) {
          throw new Error("Моля въведете парола");
        }
      }

      await setRouterConfig(ctx.user.username, input);

      // Test connection after saving config
      const configWithPassword = await getRouterConfigWithPassword(
        ctx.user.username,
      );
      if (configWithPassword) {
        try {
          await mikrotikService.testConnection(configWithPassword);
        } catch (error) {
          throw new Error(
            "Успешно запазено, но неуспешна връзка с MikroTik рутер",
          );
        }
      }

      return { success: true, message: "Успешно свързване с MikroTik рутер" };
    }),

  /**
   * Get all clients from the router.
   */
  getClients: protectedProcedure.query(async ({ ctx }) => {
    const config = await getRouterConfigWithPassword(ctx.user.username);
    if (!config) {
      throw new Error(
        "Не сте свързани с MikroTik рутер. Моля конфигурирайте връзката.",
      );
    }

    try {
      const clients = await mikrotikService.getAllClients(config);
      return clients;
    } catch (error: any) {
      console.error("Get clients error:", error);
      throw new Error(error.message || "Грешка при четене на клиенти");
    }
  }),

  /**
   * Get connection status.
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const config = await getRouterConfig(ctx.user.username);
    if (!config) {
      return {
        connected: false,
        routerIp: null,
      };
    }

    // Test connection
    const configWithPassword = await getRouterConfigWithPassword(
      ctx.user.username,
    );
    if (!configWithPassword) {
      return {
        connected: false,
        routerIp: config.ip,
      };
    }

    try {
      const isConnected =
        await mikrotikService.testConnection(configWithPassword);
      return {
        connected: isConnected,
        routerIp: config.ip,
      };
    } catch (error) {
      return {
        connected: false,
        routerIp: config.ip,
      };
    }
  }),
});
