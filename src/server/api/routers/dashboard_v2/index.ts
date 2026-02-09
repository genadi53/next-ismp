import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { trucksRouterV2 } from "./trucks";
import { productionRouter } from "./production";
import {
  getShiftIdsForPeriod,
  getAllShifts,
  getCurrentShiftId,
} from "@/server/repositories/dashboard_v2/shifts.repository";
import z from "zod";

export const dashboardV2Router = createTRPCRouter({
  trucks: trucksRouterV2,
  production: productionRouter,
  shifts: createTRPCRouter({
    getShiftIdsForPeriod: publicProcedure
      .input(
        z.object({
          period: z.enum(["today", "yesterday", "month"]),
        }),
      )
      .query(async ({ input }) => {
        const rows = await getShiftIdsForPeriod(input.period);
        if (!rows || rows.length === 0) {
          return null;
        }

        const { StartShiftId, EndShiftId } = rows[0]!;
        return {
          startShiftId: StartShiftId,
          endShiftId: EndShiftId,
        };
      }),
    getAllShifts: publicProcedure.query(async () => {
      return getAllShifts();
    }),
    getCurrentShiftId: publicProcedure.query(async () => {
      return getCurrentShiftId();
    }),
  }),
});
