import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  DmaAsset,
  CreateDmaAssetInput,
  UpdateDmaAssetInput,
  DmaReport,
} from "./types.assets";

/**
 * Get all DMA assets/components.
 */
export async function getAllDmaAssets(): Promise<DmaAsset[]> {
  return sqlQuery<DmaAsset>(`
    SELECT [Id],
           [Name],
           [Marka],
           [Model],
           [EdPrice],
           [Currency],
           [Description],
           CONVERT(NVARCHAR, [lrd], 120) AS [lrd],
           [CreatedFrom],
           [LastUpdatedFrom]
    FROM [ISMP].[dma].[Components]
    ORDER BY [Id] DESC
  `);
}

/**
 * Create a new DMA asset/component.
 */
export async function createDmaAsset(
  input: CreateDmaAssetInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("Name", input.Name);
    request.input("Marka", input.Marka);
    request.input("Model", input.Model);
    request.input("EdPrice", input.EdPrice);
    request.input("Currency", input.Currency);
    request.input("Description", input.Description);
    request.input("CreatedFrom", input.CreatedFrom ?? "system");
    // Same as CreatedFrom for the first time
    request.input("LastUpdatedFrom", input.CreatedFrom ?? "system");

    await request.query(`
      INSERT INTO [ISMP].[dma].[Components] (
        [Name], [Marka], [Model], [EdPrice], [Currency], [Description], [CreatedFrom], [LastUpdatedFrom], [lrd]
      )
      VALUES (@Name, @Marka, @Model, @EdPrice, @Currency, @Description, @CreatedFrom, @LastUpdatedFrom, GETDATE())
    `);
  });
}

/**
 * Update an existing DMA asset/component.
 */
export async function updateDmaAsset(
  id: number,
  input: UpdateDmaAssetInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("Name", input.Name);
    request.input("Marka", input.Marka);
    request.input("Model", input.Model);
    request.input("EdPrice", input.EdPrice);
    request.input("Currency", input.Currency);
    request.input("Description", input.Description);
    request.input("LastUpdatedFrom", input.LastUpdatedFrom);

    await request.query(`
      UPDATE [ISMP].[dma].[Components] 
      SET [Name] = @Name,
          [Marka] = @Marka,
          [Model] = @Model,
          [EdPrice] = @EdPrice,
          [Currency] = @Currency,
          [Description] = @Description,
          [lrd] = GETDATE(),
          [LastUpdatedFrom] = @LastUpdatedFrom
      WHERE Id = @id
    `);
  });
}

/**
 * Delete a DMA asset/component.
 */
export async function deleteDmaAsset(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      DELETE FROM [ISMP].[dma].[Components] WHERE Id = @id
    `);
  });
}

/**
 * Get DMA reports.
 */
export async function getDmaReports(): Promise<DmaReport[]> {
  return sqlQuery<DmaReport>(`
    SELECT TOP 100 
           docs.[Id] AS ID,
           CONCAT(CASE docs.Doctype
             WHEN 1 THEN 'Акт за приемане на ДМА'
             WHEN 2 THEN 'Акт за приемане на ДМА с реконструкция'
           END, ' / ', [DocTypeId], ' / ', FORMAT(docs.DocDate, 'yyyy-MM-dd')) AS [Тип на документа / Дата],
           [Supplier] AS [Доставчици],
           CONCAT([Inv], ' / ', FORMAT([InvDate], 'yyyy-MM-dd')) AS [Фактура / Дата],
           InvestitionID AS [Код],
           [Department] AS [Дирекция],
           [Reconstruction] AS [Реконструкция],
           (act_amount.Amount + DocAmount) AS [Стойност на акта],
           (SELECT TOP 1 CONCAT(comp.[Name], ' / ', comp.[Marka]) AS CompName
            FROM [ISMP].[dma].[DocumentsDet] AS docs_det 
            INNER JOIN [ISMP].[dma].[Components] AS comp ON comp.Id = docs_det.CompId
            WHERE docs_det.[DocId] = docs.Id) AS [Актив],
           [IsPrinted] AS [Отпечатан],
           docs.[CreatedFrom] AS [Създаден от],
           CONCAT(docs.[LastUpdatedFrom], ' / ', FORMAT(docs.lrd, 'yyyy-MM-dd')) AS [Последна редакция от / на]
    FROM [ISMP].[dma].[Documents] AS docs 
    INNER JOIN [ISMP].[dma].[Suppliers] AS supl ON supl.Id = docs.SupplierId
    INNER JOIN [ISMP].[dma].[Departments] AS dept ON dept.Id = docs.DepartmentId
    LEFT JOIN (
      SELECT [DocId], SUM(Amount) AS Amount 
      FROM (
        SELECT [DocId], SUM([DocSuplAmount]) AS Amount
        FROM [ISMP].[dma].[DocumentsSupllier]
        GROUP BY [DocId]
        UNION ALL
        SELECT [DocId], SUM([CompUnits]*[Price]) AS Amount
        FROM [ISMP].[dma].[DocumentsDet]
        GROUP BY [DocId]
      ) AS aa_amount 
      GROUP BY [DocId]
    ) AS act_amount ON docs.Id = act_amount.DocId
  `);
}
