import { sqlQuery, sqlQueryOne, sqlTransaction } from "@/server/database/db";
import type {
  DmaDocument,
  DmaDocumentDetail,
  CreateDmaDocumentInput,
  DmaDocumentSupplier,
  CreateDmaDocumentSupplierInput,
  DmaDocumentAsset,
  CreateDmaDocumentAssetInput,
  DmaAllowedDate,
  CreateDmaAllowedDateInput,
  DmaDocumentsDetails,
} from "./types.documents";

/**
 * Get all DMA documents.
 */
export async function getAllDmaDocuments(): Promise<DmaDocument[]> {
  return sqlQuery<DmaDocument>(`
    SELECT docs.[Id] AS [ID],
           CONCAT(CASE docs.Doctype
             WHEN 1 THEN 'Акт за приемане на ДМА'
             WHEN 2 THEN 'Акт за приемане на ДМА с реконструкция'
           END, ' / ', FORMAT(docs.DocDate, 'yyyy-MM-dd')) AS [Тип на документа / Дата],
           supl.Supplier AS [Доставчици],
           CONCAT(docs.Inv, ' / ', FORMAT(docs.InvDate, 'yyyy-MM-dd')) AS [Фактура / Дата],
           dept.Department AS [Дирекция],
           docs.Reconstruction AS [Реконструкция],
           FORMAT(ISNULL(act_amount.Amount, 0) + ISNULL(docs.DocAmount, 0), 'N2') + ' лв.' AS [Стойност на акта],
           CONCAT(comp.[Name], ' ', comp.[Marka], ' / SN:', ISNULL(DocDet.SerialNum, '')) AS [Актив / Сериен №],
           docs.InvestitionID AS [Код Инвестиция],
           CONCAT(docs.CreatedFrom, ' / ', CASE WHEN docs.IsPrinted = 1 THEN 'Да' ELSE 'Не' END) AS [Създаден от / Отпечатан],
           docs.LastUpdatedFrom AS [Последна редакция от],
           FORMAT(docs.lrd, 'yyyy-MM-dd HH:mm:ss') AS [Последна редакция на]
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
      ) AS sub_amounts
      GROUP BY DocId
    ) AS act_amount ON docs.Id = act_amount.DocId
    LEFT JOIN [ISMP].[dma].[DocumentsDet] AS DocDet ON docs.Id = DocDet.DocId
    LEFT JOIN [ISMP].[dma].[Components] AS comp ON comp.Id = DocDet.CompId
    ORDER BY Id DESC
  `);
}

/**
 * Get a single DMA document by ID.
 */
export async function getDmaDocumentById(
  id: number,
): Promise<DmaDocumentDetail | null> {
  return sqlQueryOne<DmaDocumentDetail>(
    `
    SELECT docs.[Id],
           docs.[Doctype],
           docs.[DocTypeId],
           FORMAT(docs.[DocDate], 'yyyy-MM-dd') AS [DocDate],
           docs.[SupplierId],
           docs.[DepartmentId],
           docs.[Inv],
           FORMAT(docs.[InvDate], 'yyyy-MM-dd') AS [InvDate],
           docs.[DocAmount],
           docs.[Reconstruction],
           FORMAT(docs.[VuzlagatelnoDate], 'yyyy-MM-dd') AS [VuzlagatelnoDate],
           docs.[Vuzlagatelno],
           docs.[InvestitionID],
           docs.[DocsDepartment],
           docs.[DocsDepMol],
           docs.[DocsDepMolDuty],
           docs.[DocsDepartmentDesc],
           docs.[DocsDeptApproval],
           docs.[DocsDeptApprovalDuty],
           docs.[DocsSuplierName],
           docs.[DocsSuplierDesc],
           FORMAT(docs.[lrd], 'yyyy-MM-dd HH:mm:ss') AS [lrd],
           docs.[CreatedFrom],
           docs.[LastUpdatedFrom],
           docs.[IsPrinted],
           supl.[Supplier],
           dept.[Department]
    FROM [ISMP].[dma].[Documents] AS docs
    INNER JOIN [ISMP].[dma].[Suppliers] AS supl ON supl.Id = docs.SupplierId
    INNER JOIN [ISMP].[dma].[Departments] AS dept ON dept.Id = docs.DepartmentId
    WHERE docs.[Id] = @id
  `,
    { id },
  );
}

/**
 * Get document details for dropdowns (departments and suppliers).
 */
export async function getDmaDocumentsDetails(): Promise<DmaDocumentsDetails> {
  const suppliers = await sqlQuery<{ Supplier: string }>(`
    SELECT [Supplier] FROM [ISMP].[dma].[Suppliers] ORDER BY Supplier
  `);

  const departments = await sqlQuery<{ Department: string }>(`
    SELECT CONCAT([Department], ' (', [DepMol], ')') AS [Department]
    FROM [ISMP].[dma].[Departments]
    WHERE active = 1
    ORDER BY Department
  `);

  return {
    suppliers: suppliers.map((s) => s.Supplier),
    departments: departments.map((d) => d.Department),
  };
}

/**
 * Create a new DMA document.
 */
export async function createDmaDocument(
  input: CreateDmaDocumentInput,
): Promise<{ id: number }> {
  let documentId: number | null = null;

  await sqlTransaction(async (request) => {
    // Extract year from date string
    const docYear = input.DocDate ? parseInt(input.DocDate.split("-")[0]!) : null;

    // Get last document ID for this year and type
    request.input("docYear", docYear);
    request.input("doctype", input.Doctype);
    const lastIdResult = await request.query<{ lastId: number | null }>(`
      SELECT MAX([DocTypeId]) AS lastId
      FROM [ISMP].[dma].[Documents]
      WHERE YEAR([DocDate]) = @docYear AND DocType = @doctype
    `);
    const lastDocumentId = lastIdResult.recordset[0]?.lastId ?? 0;

    request.input("DocTypeId", lastDocumentId + 1);
    request.input("DocDate", input.DocDate);
    request.input("SupplierId", input.SupplierId);
    request.input("DepartmentId", input.DepartmentId);
    request.input("Inv", input.Inv);
    request.input("InvDate", input.InvDate);
    request.input("DocAmount", input.DocAmount);
    request.input("Reconstruction", input.Reconstruction);
    request.input("VuzlagatelnoDate", input.VuzlagatelnoDate);
    request.input("Vuzlagatelno", input.Vuzlagatelno);
    request.input("InvestitionID", input.InvestitionID);
    request.input("DocsDepartment", input.DocsDepartment);
    request.input("DocsDepMol", input.DocsDepMol);
    request.input("DocsDepMolDuty", input.DocsDepMolDuty);
    request.input("DocsDepartmentDesc", input.DocsDepartmentDesc);
    request.input("DocsDeptApproval", input.DocsDeptApproval);
    request.input("DocsDeptApprovalDuty", input.DocsDeptApprovalDuty);
    request.input("DocsSuplierName", input.DocsSuplierName);
    request.input("DocsSuplierDesc", input.DocsSuplierDesc);
    request.input("CreatedFrom", input.CreatedFrom ?? "system");
    request.input("LastUpdatedFrom", input.LastUpdatedFrom);

    const result = await request.query<{ Id: number }>(`
      INSERT INTO [ISMP].[dma].[Documents] (
        [Doctype], [DocTypeId], [DocDate], [SupplierId], [DepartmentId],
        [Inv], [InvDate], [DocAmount], [Reconstruction], [VuzlagatelnoDate],
        [Vuzlagatelno], [InvestitionID], [DocsDepartment], [DocsDepMol],
        [DocsDepMolDuty], [DocsDepartmentDesc], [DocsDeptApproval],
        [DocsDeptApprovalDuty], [DocsSuplierName], [DocsSuplierDesc],
        [lrd], [CreatedFrom], [LastUpdatedFrom]
      )
      VALUES (
        @doctype, @DocTypeId, @DocDate, @SupplierId, @DepartmentId,
        @Inv, @InvDate, @DocAmount, @Reconstruction, @VuzlagatelnoDate,
        @Vuzlagatelno, @InvestitionID, @DocsDepartment, @DocsDepMol,
        @DocsDepMolDuty, @DocsDepartmentDesc, @DocsDeptApproval,
        @DocsDeptApprovalDuty, @DocsSuplierName, @DocsSuplierDesc,
        GETDATE(), @CreatedFrom, @LastUpdatedFrom
      );
      SELECT SCOPE_IDENTITY() AS Id;
    `);
    documentId = result.recordset[0]?.Id ?? null;
  });

  if (documentId === null) {
    throw new Error("Failed to create document");
  }

  return { id: documentId };
}

/**
 * Update an existing DMA document.
 */
export async function updateDmaDocument(
  id: number,
  input: CreateDmaDocumentInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("Doctype", input.Doctype);
    request.input("DocDate", input.DocDate);
    request.input("SupplierId", input.SupplierId);
    request.input("DepartmentId", input.DepartmentId);
    request.input("Inv", input.Inv);
    request.input("InvDate", input.InvDate);
    request.input("DocAmount", input.DocAmount);
    request.input("Reconstruction", input.Reconstruction);
    request.input("VuzlagatelnoDate", input.VuzlagatelnoDate);
    request.input("Vuzlagatelno", input.Vuzlagatelno);
    request.input("InvestitionID", input.InvestitionID);
    request.input("DocsDepartment", input.DocsDepartment);
    request.input("DocsDepMol", input.DocsDepMol);
    request.input("DocsDepMolDuty", input.DocsDepMolDuty);
    request.input("DocsDepartmentDesc", input.DocsDepartmentDesc);
    request.input("DocsDeptApproval", input.DocsDeptApproval);
    request.input("DocsDeptApprovalDuty", input.DocsDeptApprovalDuty);
    request.input("DocsSuplierName", input.DocsSuplierName);
    request.input("DocsSuplierDesc", input.DocsSuplierDesc);
    request.input("LastUpdatedFrom", input.LastUpdatedFrom ?? "system");

    await request.query(`
      UPDATE [ISMP].[dma].[Documents] 
      SET [Doctype] = @Doctype,
          [DocDate] = @DocDate,
          [SupplierId] = @SupplierId,
          [DepartmentId] = @DepartmentId,
          [Inv] = @Inv,
          [InvDate] = @InvDate,
          [DocAmount] = @DocAmount,
          [Reconstruction] = @Reconstruction,
          [VuzlagatelnoDate] = @VuzlagatelnoDate,
          [Vuzlagatelno] = @Vuzlagatelno,
          [InvestitionID] = @InvestitionID,
          [DocsDepartment] = @DocsDepartment,
          [DocsDepMol] = @DocsDepMol,
          [DocsDepMolDuty] = @DocsDepMolDuty,
          [DocsDepartmentDesc] = @DocsDepartmentDesc,
          [DocsDeptApproval] = @DocsDeptApproval,
          [DocsDeptApprovalDuty] = @DocsDeptApprovalDuty,
          [DocsSuplierName] = @DocsSuplierName,
          [DocsSuplierDesc] = @DocsSuplierDesc,
          [lrd] = GETDATE(),
          [LastUpdatedFrom] = @LastUpdatedFrom
      WHERE [Id] = @id
    `);
  });
}

/**
 * Delete a DMA document.
 */
export async function deleteDmaDocument(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      DELETE FROM [ISMP].[dma].[Documents] WHERE Id = @id
    `);
  });
}

// --- Document Suppliers ---

/**
 * Get suppliers for a document.
 */
export async function getDmaDocumentSuppliers(
  documentId: number,
): Promise<DmaDocumentSupplier[]> {
  return sqlQuery<DmaDocumentSupplier>(
    `
    SELECT dcSupl.[id],
           [DocId],
           [DocSupplierId],
           [Supplier],
           [DocSuplAmount],
           [Inv],
           CONVERT(NVARCHAR, CAST([InvDate] AS DATE), 120) AS InvDate,
           CONVERT(NVARCHAR, dcSupl.[lrd], 120) AS lrd,
           dcSupl.[CreatedFrom],
           dcSupl.[LastUpdatedFrom]
    FROM [ISMP].[dma].[DocumentsSupllier] AS dcSupl
    INNER JOIN [ISMP].[dma].[Suppliers] AS supl ON supl.Id = dcSupl.[DocSupplierId]
    WHERE DocId = @documentId
  `,
    { documentId },
  );
}

/**
 * Create a document supplier.
 */
export async function createDmaDocumentSupplier(
  documentId: number,
  input: CreateDmaDocumentSupplierInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("documentId", documentId);
    request.input("DocSupplierId", input.DocSupplierId);
    request.input("DocSuplierName", input.DocSuplierName);
    request.input("DocSuplierDesc", input.DocSuplierDesc);
    request.input("DocSuplAmount", input.DocSuplAmount);
    request.input("Inv", input.Inv);
    request.input("InvDate", input.InvDate);
    request.input("CreatedFrom", input.CreatedFrom ?? "system");
    request.input("LastUpdatedFrom", input.LastUpdatedFrom ?? "system");

    await request.query(`
      INSERT INTO [ISMP].[dma].[DocumentsSupllier] (
        [DocId], [DocSupplierId], [DocSuplierName], [DocSuplierDesc],
        [DocSuplAmount], [Inv], [InvDate], [lrd], [CreatedFrom], [LastUpdatedFrom]
      )
      VALUES (
        @documentId, @DocSupplierId, @DocSuplierName, @DocSuplierDesc,
        @DocSuplAmount, @Inv, @InvDate, GETDATE(), @CreatedFrom, @LastUpdatedFrom
      )
    `);
  });
}

/**
 * Update a document supplier.
 */
export async function updateDmaDocumentSupplier(
  documentId: number,
  supplierId: number,
  input: CreateDmaDocumentSupplierInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("documentId", documentId);
    request.input("supplierId", supplierId);
    request.input("DocSupplierId", input.DocSupplierId);
    request.input("DocSuplierName", input.DocSuplierName);
    request.input("DocSuplierDesc", input.DocSuplierDesc);
    request.input("DocSuplAmount", input.DocSuplAmount);
    request.input("Inv", input.Inv);
    request.input("InvDate", input.InvDate);
    request.input("LastUpdatedFrom", input.LastUpdatedFrom ?? "system");

    await request.query(`
      UPDATE [ISMP].[dma].[DocumentsSupllier] 
      SET [DocSupplierId] = @DocSupplierId,
          [DocSuplierName] = @DocSuplierName,
          [DocSuplierDesc] = @DocSuplierDesc,
          [DocSuplAmount] = @DocSuplAmount,
          [Inv] = @Inv,
          [InvDate] = @InvDate,
          [LastUpdatedFrom] = @LastUpdatedFrom
      WHERE [Id] = @supplierId AND [DocId] = @documentId
    `);
  });
}

/**
 * Delete a document supplier.
 */
export async function deleteDmaDocumentSupplier(
  documentId: number,
  supplierId: number,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("documentId", documentId);
    request.input("supplierId", supplierId);
    await request.query(`
      DELETE FROM [ISMP].[dma].[DocumentsSupllier]
      WHERE DocId = @documentId AND id = @supplierId
    `);
  });
}

// --- Document Assets ---

/**
 * Get assets for a document.
 */
export async function getDmaDocumentAssets(
  documentId: number,
): Promise<DmaDocumentAsset[]> {
  return sqlQuery<DmaDocumentAsset>(
    `
    SELECT docs_det.[Id],
           docs_det.[DocId],
           docs_det.[CompId],
           docs_det.[CompUnits],
           docs_det.[Price],
           docs_det.[Mea],
           docs_det.[SerialNum],
           docs_det.[DetExploatation],
           docs_det.[DetExploatationMeasure],
           FORMAT(docs_det.[DetDateBuy], 'yyyy-MM-dd') AS [DetDateBuy],
           FORMAT(docs_det.[DetStartExploatation], 'yyyy-MM-dd') AS [DetStartExploatation],
           FORMAT(docs_det.[DetApprovedDMA], 'yyyy-MM-dd') AS [DetApprovedDMA],
           FORMAT(docs_det.[lrd], 'yyyy-MM-dd HH:mm:ss') AS [lrd],
           docs_det.[CreatedFrom],
           docs_det.[LastUpdatedFrom],
           comp.[Name] AS [ComponentName],
           comp.[Marka] AS [ComponentMarka],
           comp.[Model] AS [ComponentModel]
    FROM [ISMP].[dma].[DocumentsDet] AS docs_det
    INNER JOIN [ISMP].[dma].[Components] AS comp ON comp.Id = docs_det.CompId
    WHERE docs_det.[DocId] = @documentId
    ORDER BY docs_det.[Id] DESC
  `,
    { documentId },
  );
}

/**
 * Create a document asset.
 */
export async function createDmaDocumentAsset(
  documentId: number,
  input: CreateDmaDocumentAssetInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("DocId", documentId);
    request.input("CompId", input.CompId);
    request.input("CompUnits", input.CompUnits ?? 0);
    request.input("Price", input.Price ?? 0);
    request.input("Mea", input.Mea);
    request.input("SerialNum", input.SerialNum);
    request.input("DetExploatation", input.DetExploatation);
    request.input("DetExploatationMeasure", input.DetExploatationMeasure);
    request.input("DetDateBuy", input.DetDateBuy);
    request.input("DetStartExploatation", input.DetStartExploatation);
    request.input("DetApprovedDMA", input.DetApprovedDMA);
    request.input("CreatedFrom", input.CreatedFrom ?? "system");
    request.input("LastUpdatedFrom", input.LastUpdatedFrom ?? "system");

    await request.query(`
      INSERT INTO [ISMP].[dma].[DocumentsDet] (
        [DocId], [CompId], [CompUnits], [Price], [Mea], [SerialNum],
        [DetExploatation], [DetExploatationMeasure], [DetDateBuy],
        [DetStartExploatation], [DetApprovedDMA], [lrd], [CreatedFrom], [LastUpdatedFrom]
      )
      VALUES (
        @DocId, @CompId, @CompUnits, @Price, @Mea, @SerialNum,
        @DetExploatation, @DetExploatationMeasure, @DetDateBuy,
        @DetStartExploatation, @DetApprovedDMA, GETDATE(), @CreatedFrom, @LastUpdatedFrom
      )
    `);
  });
}

/**
 * Update a document asset.
 */
export async function updateDmaDocumentAsset(
  documentId: number,
  assetId: number,
  input: CreateDmaDocumentAssetInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("documentId", documentId);
    request.input("assetId", assetId);
    request.input("CompId", input.CompId);
    request.input("CompUnits", input.CompUnits ?? 0);
    request.input("Price", input.Price ?? 0);
    request.input("Mea", input.Mea);
    request.input("SerialNum", input.SerialNum);
    request.input("DetExploatation", input.DetExploatation);
    request.input("DetExploatationMeasure", input.DetExploatationMeasure);
    request.input("DetDateBuy", input.DetDateBuy);
    request.input("DetStartExploatation", input.DetStartExploatation);
    request.input("DetApprovedDMA", input.DetApprovedDMA);
    request.input("LastUpdatedFrom", input.LastUpdatedFrom ?? "system");

    await request.query(`
      UPDATE [ISMP].[dma].[DocumentsDet] 
      SET [CompId] = @CompId,
          [CompUnits] = @CompUnits,
          [Price] = @Price,
          [Mea] = @Mea,
          [SerialNum] = @SerialNum,
          [DetExploatation] = @DetExploatation,
          [DetExploatationMeasure] = @DetExploatationMeasure,
          [DetDateBuy] = @DetDateBuy,
          [DetStartExploatation] = @DetStartExploatation,
          [DetApprovedDMA] = @DetApprovedDMA,
          [lrd] = GETDATE(),
          [LastUpdatedFrom] = @LastUpdatedFrom
      WHERE Id = @assetId AND DocId = @documentId
    `);
  });
}

/**
 * Delete a document asset.
 */
export async function deleteDmaDocumentAsset(
  documentId: number,
  assetId: number,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("documentId", documentId);
    request.input("assetId", assetId);
    await request.query(`
      DELETE FROM [ISMP].[dma].[DocumentsDet]
      WHERE Id = @assetId AND DocId = @documentId
    `);
  });
}

// --- Allowed Date ---

/**
 * Get the current allowed date range for documents.
 */
export async function getDmaAllowedDate(): Promise<DmaAllowedDate | null> {
  return sqlQueryOne<DmaAllowedDate>(`
    SELECT TOP 1
           CONVERT(NVARCHAR, ISNULL([StartDate], DATEADD(DAY, 1, DATEADD(MONTH, -1, [EndDate]))), 120) AS [StartDate],
           CONVERT(NVARCHAR, ISNULL([EndDate], EOMONTH([StartDate])), 120) AS [EndDate],
           [StoppedAll]
    FROM [ISMP].[dma].[DocumentsAllowedDate]
    ORDER BY id DESC
  `);
}

/**
 * Create a new allowed date entry.
 */
export async function createDmaAllowedDate(
  input: CreateDmaAllowedDateInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("StartDate", input.StartDate);
    request.input("EndDate", input.EndDate);
    request.input("StoppedAll", input.StoppedAll);

    await request.query(`
      INSERT INTO [ISMP].[dma].[DocumentsAllowedDate] ([StartDate], [EndDate], [StoppedAll])
      VALUES (@StartDate, @EndDate, @StoppedAll)
    `);
  });
}

/**
 * Stop all documents for a specific allowed date entry.
 */
export async function stopDmaAllowedDate(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      UPDATE [ISMP].[dma].[DocumentsAllowedDate]
      SET [StoppedAll] = 1
      WHERE ID = @id
    `);
  });
}

/**
 * Request edit for a document.
 */
export async function requestDocumentEdit(
  docId: number,
  requestedFrom: string,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("docId", docId);
    request.input("requestedFrom", requestedFrom);

    await request.query(`
      INSERT INTO [ISMP].[dbo].[RequestedEditDoc] ([DocId], [RequestedDate], [RequestedFrom], [log])
      VALUES (@docId, GETDATE(), @requestedFrom, 'Изиска Редакция на акт')
    `);
  });
}

