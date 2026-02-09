import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  countTruckRegion,
  totalSumTrucks,
  hourCountTruck,
  hourProdTruck,
  getInfoTrucks,
} from "@/server/repositories/dashboard/trucks.repository";

export const trucksRouter = createTRPCRouter({
  /**
   * Get truck count by region for the current shift.
   */
  countByRegion: publicProcedure.query(async () => {
    return countTruckRegion();
  }),

  /**
   * Get total sum of trucks by status and region.
   */
  totalSum: publicProcedure.query(async () => {
    return totalSumTrucks();
  }),

  /**
   * Get hourly truck count for the current shift.
   */
  hourlyCount: publicProcedure.query(async () => {
    return hourCountTruck();
  }),

  /**
   * Get hourly truck production for the current shift.
   */
  hourlyProduction: publicProcedure.query(async () => {
    return hourProdTruck();
  }),

  /**
   * Get information about trucks (location, assignment, delay reason).
   */
  getInfo: publicProcedure.query(async () => {
    return getInfoTrucks();
  }),
});

