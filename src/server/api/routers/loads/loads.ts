import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getLoads,
  getUnsentLoads,
  createLoad,
  markLoadSent,
} from "@/server/repositories/loads/loads.repository";

const createLoadSchema = z.object({
  Adddate: z.string(),
  Shift: z.number(),
  Shovel: z.string().min(1, "Shovel is required"),
  Truck: z.string().min(1, "Truck is required"),
  Br: z.number().nullable(),
  AddMaterial: z.string().nullable(),
  RemoveMaterial: z.string().nullable(),
  userAdded: z.string().nullable(),
});

export const loadsRouter = createTRPCRouter({
  /**
   * Get all loads from the last 6 months.
   */
  getAll: publicProcedure.query(async () => {
    return getLoads();
  }),

  /**
   * Get unsent loads.
   */
  getUnsent: publicProcedure.query(async () => {
    return getUnsentLoads();
  }),

  /**
   * Create a new load entry.
   */
  create: publicProcedure
    .input(createLoadSchema)
    .mutation(async ({ input }) => {
      await createLoad(input);
      return { success: true, message: "Load created successfully" };
    }),

  /**
   * Mark a load as sent.
   */
  markSent: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markLoadSent(input.id);
      return { success: true, message: "Load marked as sent" };
    }),
});

