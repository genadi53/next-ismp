import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getGasMeasurements,
  getGasMeasurementsEdit,
  updateGasMeasurements,
  createGasMeasurements,
  getGasReferences,
  getSamplerDetails,
} from "@/server/repositories/pvr/gas.repository";
import { nameInput } from "@/lib/username";

const createGasMeasurementSchema = z.object({
  GasID: z.number(),
  GasValue: z.number(),
  MeasuredFrom: z.string().nullable(),
  MeasuredDuty: z.string().nullable(),
  MeasuredOn: z.string(),
  Horizont: z.number(),
});

const updateGasMeasurementSchema = z.object({
  GasID: z.number(),
  GasValue: z.number(),
  MeasuredFrom: z.string().nullable(),
  MeasuredDuty: z.string().nullable(),
  MeasuredOn: z.string(),
  Horizont: z.number(),
  OldMeasuredOn: z.string(),
});

export const gasRouter = createTRPCRouter({
  /**
   * Get gas measurements (last 100).
   */
  getAll: protectedProcedure.query(async () => {
    return getGasMeasurements();
  }),

  /**
   * Get gas measurements for editing by date and elevation.
   */
  getForEdit: protectedProcedure
    .input(z.object({ date: z.string(), elevation: z.number() }))
    .query(async ({ input }) => {
      return getGasMeasurementsEdit(input.date, input.elevation);
    }),

  /**
   * Get gas references.
   */
  getReferences: protectedProcedure.query(async () => {
    return getGasReferences();
  }),

  /**
   * Get sampler details (names and duties).
   */
  getSamplerDetails: protectedProcedure.query(async () => {
    return getSamplerDetails();
  }),

  /**
   * Create gas measurements.
   */
  create: protectedProcedure
    .input(z.array(createGasMeasurementSchema))
    .mutation(async ({ input, ctx }) => {
      await createGasMeasurements(
        input.map((measurement) => ({
          ...measurement,
          lrdFrom: nameInput(ctx.user.username, ctx.user.nameBg),
        })),
      );
      return {
        success: true,
        message: "Gas measurements created successfully",
      };
    }),

  /**
   * Update gas measurements.
   */
  update: protectedProcedure
    .input(z.array(updateGasMeasurementSchema))
    .mutation(async ({ input, ctx }) => {
      await updateGasMeasurements(
        input.map((measurement) => ({
          ...measurement,
          lrdFrom: nameInput(ctx.user.username, ctx.user.nameBg),
        })),
      );
      return {
        success: true,
        message: "Gas measurements updated successfully",
      };
    }),
});
