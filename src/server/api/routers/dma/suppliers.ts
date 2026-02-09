import { z } from "zod";
import { nameInput } from "@/lib/username";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getAllDmaSuppliers,
  createDmaSupplier,
  updateDmaSupplier,
  deleteDmaSupplier,
} from "@/server/repositories/dma/suppliers.repository";

const createSupplierSchema = z.object({
  Supplier: z.string().min(1, "Supplier name is required"),
  SupplierDesc: z.string().nullable().default(null),
});

export const suppliersRouter = createTRPCRouter({
  /**
   * Get all DMA suppliers.
   */
  getAll: protectedProcedure.query(async () => {
    return getAllDmaSuppliers();
  }),

  /**
   * Create a new DMA supplier.
   */
  create: protectedProcedure
    .input(createSupplierSchema)
    .mutation(async ({ input, ctx }) => {
      await createDmaSupplier({
        Supplier: input.Supplier,
        SupplierDesc: input.SupplierDesc ?? null,
        CreatedFrom: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Supplier created successfully" };
    }),

  /**
   * Update an existing DMA supplier.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: createSupplierSchema }))
    .mutation(async ({ input, ctx }) => {
      await updateDmaSupplier(input.id, {
        Supplier: input.data.Supplier,
        SupplierDesc: input.data.SupplierDesc ?? null,
        LastUpdatedFrom: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Supplier updated successfully" };
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      await deleteDmaSupplier(input.id);
      return { success: true, message: "Supplier deleted successfully" };
    }),
});
