import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type { Load, CreateLoadInput } from "./types.loads";
import { format } from "date-fns";

/**
 * Get all loads from the last 6 months.
 */
export async function getLoads(): Promise<Load[]> {
  return sqlQuery<Load>(`
    SELECT [id],
           [Adddate],
           [Shift],
           [Shovel],
           [Truck],
           [Br],
           [AddMaterial],
           [RemoveMaterial],
           [lrd],
           [lrby],
           [userAdded],
           [sentReport]
    FROM [ELLDBAdmins].[dbo].[Kursove]
    WHERE Adddate > DATEADD(MONTH, -6, GETDATE()) 
    ORDER BY Adddate DESC
  `);
}

/**
 * Get unsent loads.
 */
export async function getUnsentLoads(): Promise<Load[]> {
  return sqlQuery<Load>(`
    SELECT [id],
           [Adddate],
           [Shift],
           [Shovel],
           [Truck],
           [Br],
           [AddMaterial],
           [RemoveMaterial],
           [lrd],
           [lrby],
           [userAdded],
           [sentReport]
    FROM [ELLDBAdmins].[dbo].[Kursove]
    WHERE sentReport = 0
  `);
}

/**
 * Create a new load entry.
 */
export async function createLoad(input: CreateLoadInput): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("Adddate", format(input.Adddate, "yyyy-LL-dd"));
    request.input("Shift", input.Shift);
    request.input("Shovel", input.Shovel);
    request.input("Truck", input.Truck);
    request.input("Br", input.Br);
    request.input("AddMaterial", input.AddMaterial);
    request.input("RemoveMaterial", input.RemoveMaterial);
    request.input("userAdded", "test@testov.com");

    await request.query(`
      INSERT INTO [ELLDBAdmins].[dbo].[Kursove] (
        Adddate, Shift, Shovel, Truck, Br, AddMaterial, RemoveMaterial, userAdded, sentReport
      )
      VALUES (@Adddate, @Shift, @Shovel, @Truck, @Br, @AddMaterial, @RemoveMaterial, @userAdded, 0)
    `);
  });
}

/**
 * Mark a load as sent.
 */
export async function markLoadSent(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);

    await request.query(`
      UPDATE [ELLDBAdmins].[dbo].[Kursove]
      SET [sentReport] = 1
      WHERE id = @id
    `);
  });
}
