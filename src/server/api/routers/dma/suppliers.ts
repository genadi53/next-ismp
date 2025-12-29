import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getAllDmaSuppliers,
  createDmaSupplier,
  updateDmaSupplier,
} from "@/server/repositories/dma/suppliers.repository";

const createSupplierSchema = z.object({
  Supplier: z.string().min(1, "Supplier name is required"),
  SupplierDesc: z.string().nullable().default(null),
});

export const suppliersRouter = createTRPCRouter({
  /**
   * Get all DMA suppliers.
   */
  getAll: publicProcedure.query(async () => {
    return getAllDmaSuppliers();
  }),

  /**
   * Create a new DMA supplier.
   */
  create: publicProcedure
    .input(createSupplierSchema)
    .mutation(async ({ input }) => {
      await createDmaSupplier(input);
      return { success: true, message: "Supplier created successfully" };
    }),

  /**
   * Update an existing DMA supplier.
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: createSupplierSchema }))
    .mutation(async ({ input }) => {
      await updateDmaSupplier(input.id, input.data);
      return { success: true, message: "Supplier updated successfully" };
    }),
});
