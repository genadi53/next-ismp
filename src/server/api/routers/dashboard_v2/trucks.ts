import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getTruckTimes,
  getLoadsForPeriod,
  getTruckTimesAndLoads,
} from "@/server/repositories/dashboard_v2/trucks.repository";
import { countTruckRegion } from "@/server/repositories/dashboard/trucks.repository";

export const trucksRouterV2 = createTRPCRouter({
  /**
   * Get truck count by region for the current shift.
   */
  countByRegion: publicProcedure.query(async () => {
    return countTruckRegion();
  }),

  /**
   * Get cycle time data (cycle time, spot time, queue time) for trucks for a given period.
   */
  getCycleTimes: publicProcedure
    .input(
      z.object({
        startShiftId: z.number(),
        endShiftId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      // Get truck times data
      const truckTimes = await getTruckTimes(
        input.startShiftId,
        input.endShiftId,
      );

      // Transform data to match chart format
      return truckTimes.map((truck) => ({
        truck: truck.Truck,
        cycleTime: truck.FullCycleTimeMin ?? 0,
        spotTime: truck.SpotTime ?? 0,
        queueTime: truck.QueueTime ?? 0,
      }));
    }),

  /**
   * Get number of loads per truck for a given period.
   */
  getLoadsForPeriod: publicProcedure
    .input(
      z.object({
        startShiftId: z.number(),
        endShiftId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      // Get loads per truck for this period
      const loads = await getLoadsForPeriod(
        input.startShiftId,
        input.endShiftId,
      );

      return loads.map((row) => ({
        truck: row.Truck,
        loads: Number(row.Br ?? 0),
      }));
    }),

  /**
   * Get both cycle times and loads data in a single optimized SQL query.
   * This merges both queries into one, eliminating the need for sequential execution.
   */
  getTruckData: publicProcedure
    .input(
      z.object({
        startShiftId: z.number(),
        endShiftId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const results = await getTruckTimesAndLoads(
        input.startShiftId,
        input.endShiftId,
      );

      return {
        cycleTimes: results.map((truck) => ({
          truck: truck.Truck,
          cycleTime: truck.FullCycleTimeMin ?? 0,
          spotTime: truck.SpotTime ?? 0,
          queueTime: truck.QueueTime ?? 0,
        })),
        loads: results.map((truck) => ({
          truck: truck.Truck,
          loads: Number(truck.LoadCount ?? 0),
        })),
      };
    }),
});
