import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  DmaSupplier,
  CreateDmaSupplierInput,
  UpdateDmaSupplierInput,
} from "./types.suppliers";

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
    request.input("CreatedFrom", input.CreatedFrom ?? "system");
    request.input("LastUpdatedFrom", input.CreatedFrom ?? "system");

    await request.query(`
      INSERT INTO [ISMP].[dma].[Suppliers] ([Supplier], [SupplierDesc], [CreatedFrom], [LastUpdatedFrom])
      VALUES (@Supplier, @SupplierDesc, @CreatedFrom, @LastUpdatedFrom)
    `);
  });
}

/**
 * Update an existing DMA supplier.
 */
export async function updateDmaSupplier(
  id: number,
  input: UpdateDmaSupplierInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("Supplier", input.Supplier);
    request.input("SupplierDesc", input.SupplierDesc);
    request.input("LastUpdatedFrom", input.LastUpdatedFrom ?? "system");

    await request.query(`
      UPDATE [ISMP].[dma].[Suppliers]
      SET [Supplier] = @Supplier,
          [SupplierDesc] = @SupplierDesc,
          [LastUpdatedFrom] = @LastUpdatedFrom
      WHERE ID = @id
    `);
  });
}

/**
 * Deleta DMA supplier.
 */
export async function deleteDmaSupplier(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);

    await request.query(`
      DELETE FROM [ISMP].[dma].[Suppliers]
      WHERE ID = @id
    `);
  });
}
