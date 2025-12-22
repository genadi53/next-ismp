import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type { DmaSupplier, CreateDmaSupplierInput } from "@/types/dma";

/**
 * Get all DMA suppliers.
 */
export async function getAllDmaSuppliers(): Promise<DmaSupplier[]> {
  return sqlQuery<DmaSupplier>(`
    SELECT [Id],
           [Supplier],
           [SupplierDesc],
           [lrd],
           [CreatedFrom],
           [LastUpdatedFrom]
    FROM [ISMP].[dma].[Suppliers]
  `);
}

/**
 * Create a new DMA supplier.
 */
export async function createDmaSupplier(
  input: CreateDmaSupplierInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("Supplier", input.Supplier);
    request.input("SupplierDesc", input.SupplierDesc);

    await request.query(`
      INSERT INTO [ISMP].[dma].[Suppliers] ([Supplier], [SupplierDesc])
      VALUES (@Supplier, @SupplierDesc)
    `);
  });
}

/**
 * Update an existing DMA supplier.
 */
export async function updateDmaSupplier(
  id: number,
  input: CreateDmaSupplierInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("Supplier", input.Supplier);
    request.input("SupplierDesc", input.SupplierDesc);

    await request.query(`
      UPDATE [ISMP].[dma].[Suppliers]
      SET [Supplier] = @Supplier,
          [SupplierDesc] = @SupplierDesc
      WHERE ID = @id
    `);
  });
}

