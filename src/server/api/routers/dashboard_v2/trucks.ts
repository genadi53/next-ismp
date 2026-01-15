import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getTruckTimes,
  getLoadsForPeriod,
} from "@/server/repositories/dashboard_v2/trucks.repository";
import { getShiftIdsForPeriod } from "@/server/repositories/dashboard_v2/shifts.repository";
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
        period: z.enum(["today", "yesterday", "month"]),
      }),
    )
    .query(async ({ input }) => {
      // Get shift IDs for the period
      const shiftIds = await getShiftIdsForPeriod(input.period);

      // If no shift IDs found, return empty array
      if (!shiftIds || shiftIds.length === 0) {
        return [];
      }

      const { StartShiftId, EndShiftId } = shiftIds[0]!;
      console.log(StartShiftId, EndShiftId);

      // Get truck times data
      const truckTimes = await getTruckTimes(StartShiftId, EndShiftId);

      // Transform data to match chart format
      return truckTimes.map((truck) => ({
        truck: truck.Truck,
        cycleTime: truck.FullCycleTimeMin ?? 0,
        spotTime: (truck.SpotTime ?? 0) / 60, // Convert seconds to minutes
        queueTime: (truck.QueueTime ?? 0) / 60, // Convert seconds to minutes
      }));
    }),
});
