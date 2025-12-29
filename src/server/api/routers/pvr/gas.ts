import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getGasMeasurements,
  getGasMeasurementsEdit,
  updateGasMeasurements,
  createGasMeasurements,
  getGasReferences,
  getSamplerDetails,
} from "@/server/repositories/pvr/gas.repository";

const createGasMeasurementSchema = z.object({
  GasID: z.number(),
  GasValue: z.number(),
  MeasuredFrom: z.string().nullable(),
  MeasuredDuty: z.string().nullable(),
  MeasuredOn: z.string(),
  Horizont: z.number(),
  lrdFrom: z.string().nullable().default(null),
});

const updateGasMeasurementSchema = z.object({
  GasID: z.number(),
  GasValue: z.number(),
  MeasuredFrom: z.string().nullable(),
  MeasuredDuty: z.string().nullable(),
  MeasuredOn: z.string(),
  Horizont: z.number(),
  lrdFrom: z.string().nullable(),
  OldMeasuredOn: z.string(),
});

export const gasRouter = createTRPCRouter({
  /**
   * Get gas measurements (last 100).
   */
  getAll: publicProcedure.query(async () => {
    return getGasMeasurements();
  }),

  /**
   * Get gas measurements for editing by date and elevation.
   */
  getForEdit: publicProcedure
    .input(z.object({ date: z.string(), elevation: z.number() }))
    .query(async ({ input }) => {
      return getGasMeasurementsEdit(input.date, input.elevation);
    }),

  /**
   * Get gas references.
   */
  getReferences: publicProcedure.query(async () => {
    return getGasReferences();
  }),

  /**
   * Get sampler details (names and duties).
   */
  getSamplerDetails: publicProcedure.query(async () => {
    return getSamplerDetails();
  }),

  /**
   * Create gas measurements.
   */
  create: publicProcedure
    .input(z.array(createGasMeasurementSchema))
    .mutation(async ({ input }) => {
      await createGasMeasurements(input);
      return { success: true, message: "Gas measurements created successfully" };
    }),

  /**
   * Update gas measurements.
   */
  update: publicProcedure
    .input(z.array(updateGasMeasurementSchema))
    .mutation(async ({ input }) => {
      await updateGasMeasurements(input);
      return { success: true, message: "Gas measurements updated successfully" };
    }),
});

