import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getAllDmaAssets,
  createDmaAsset,
  updateDmaAsset,
  deleteDmaAsset,
  getDmaReports,
} from "@/server/repositories/dma/assets.repository";

const createAssetSchema = z.object({
  Name: z.string(),
  Marka: z.string().nullable(),
  Model: z.string().nullable(),
  EdPrice: z.number().nullable(),
  Description: z.string().nullable(),
  CreatedFrom: z.string().nullable().default(null),
});

const updateAssetSchema = z.object({
  Name: z.string(),
  Marka: z.string().nullable(),
  Model: z.string().nullable(),
  EdPrice: z.number().nullable(),
  Description: z.string().nullable(),
  LastUpdatedFrom: z.string().nullable().default(null),
});

export const assetsRouter = createTRPCRouter({
  /**
   * Get all DMA assets/components.
   */
  getAll: publicProcedure.query(async () => {
    throw new Error("test");
    return getAllDmaAssets();
  }),

  /**
   * Create a new DMA asset/component.
   */
  create: publicProcedure
    .input(createAssetSchema)
    .mutation(async ({ input }) => {
      await createDmaAsset(input);
      return { success: true, message: "Asset created successfully" };
    }),

  /**
   * Update an existing DMA asset/component.
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: updateAssetSchema }))
    .mutation(async ({ input }) => {
      await updateDmaAsset(input.id, input.data);
      return { success: true, message: "Asset updated successfully" };
    }),

  /**
   * Delete a DMA asset/component.
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteDmaAsset(input.id);
      return { success: true, message: "Asset deleted successfully" };
    }),

  /**
   * Get DMA reports.
   */
  getReports: publicProcedure.query(async () => {
    return getDmaReports();
  }),
});
