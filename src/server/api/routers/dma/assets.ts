import { z } from "zod";
import { nameInput } from "@/lib/username";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
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
  Currency: z.string().nullable(),
});

export const assetsRouter = createTRPCRouter({
  /**
   * Get all DMA assets/components.
   */
  getAll: protectedProcedure.query(async () => {
    // throw new Error("test");
    return getAllDmaAssets();
  }),

  /**
   * Create a new DMA asset/component.
   */
  create: protectedProcedure
    .input(createAssetSchema)
    .mutation(async ({ input, ctx }) => {
      await createDmaAsset({
        ...input,
        CreatedFrom: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Asset created successfully" };
    }),

  /**
   * Update an existing DMA asset/component.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: createAssetSchema }))
    .mutation(async ({ input, ctx }) => {
      await updateDmaAsset(input.id, {
        ...input.data,
        LastUpdatedFrom: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Asset updated successfully" };
    }),

  /**
   * Delete a DMA asset/component.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteDmaAsset(input.id);
      return { success: true, message: "Asset deleted successfully" };
    }),

  /**
   * Get DMA reports.
   */
  getReports: protectedProcedure.query(async () => {
    return getDmaReports();
  }),
});
