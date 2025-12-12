import { sqlQuery, sqlQueryOne, sqlTransaction } from "@/server/database/db";
import type {
  HermesWorkcard,
  CreateWorkcardInput,
  WorkcardDetails,
} from "@/types/hermes";
import { getOperatorNames } from "./operator.repository";
import { getEquipmentNames } from "./equipment.repository";
import { calculateDuration } from "@/lib/time";

/**
 * Get all workcards from the database.
 */
export async function getAllWorkcards(): Promise<HermesWorkcard[]> {
  return sqlQuery<HermesWorkcard>(`
    SELECT rk.[ID] AS Id
          ,CAST(CAST([Wyear] AS NVARCHAR(5)) + '-' + CAST([WMonth] AS NVARCHAR(5)) + '-' + CAST([WDay] AS NVARCHAR(5)) AS DATE) AS [Date]
          ,[StartTime]
          ,[EndTime]
          ,o.[OperatorId]
          ,o.[OperatorNamre] AS OperatorName
          ,CAST(rk.[CodeAction] AS NVARCHAR) + '-' + ac.ActionName AS [CodeAction]
          ,[Duration]
          ,[Note]
          ,[WorkingCardId]
          ,[Bukva]
          ,[EqmtId]
    FROM [Hermes].[dbo].[RabKartiData] rk
    LEFT JOIN [Hermes].[dbo].[OperatorsEnum] o ON o.ID = rk.OperatorId
    LEFT JOIN [Hermes].[dbo].[Actions] ac ON ac.CodeAction = rk.CodeAction
    ORDER BY [Date] DESC
  `);
}

/**
 * Get a single workcard by ID.
 */
export async function getWorkcardById(
  id: number,
): Promise<HermesWorkcard | null> {
  return sqlQueryOne<HermesWorkcard>(
    `
    SELECT rk.[ID] AS Id
          ,CAST(CAST([Wyear] AS NVARCHAR(5)) + '-' + CAST([WMonth] AS NVARCHAR(5)) + '-' + CAST([WDay] AS NVARCHAR(5)) AS DATE) AS [Date]
          ,[StartTime]
          ,[EndTime]
          ,o.[OperatorId]
          ,o.[OperatorNamre] AS OperatorName
          ,CAST(rk.[CodeAction] AS NVARCHAR) + '-' + ac.ActionName AS [CodeAction]
          ,[Duration]
          ,[Note]
          ,[WorkingCardId]
          ,[Bukva]
          ,[EqmtId]
    FROM [Hermes].[dbo].[RabKartiData] rk
    LEFT JOIN [Hermes].[dbo].[OperatorsEnum] o ON o.ID = rk.OperatorId
    LEFT JOIN [Hermes].[dbo].[Actions] ac ON ac.CodeAction = rk.CodeAction
    WHERE rk.[ID] = @id
  `,
    { id },
  );
}

/**
 * Get all unique workcard notes.
 */
export async function getWorkcardNotes(): Promise<string[]> {
  const results = await sqlQuery<{ Note: string }>(`
    SELECT [Note]
    FROM [Hermes].[dbo].[RabKartiData]
    GROUP BY [Note]
  `);
  return results.map((r) => r.Note);
}

/**
 * Get workcard details (notes, operators, equipments) for form dropdowns.
 */
export async function getWorkcardDetails(): Promise<WorkcardDetails> {
  const [notes, operators, equipments] = await Promise.all([
    getWorkcardNotes(),
    getOperatorNames(),
    getEquipmentNames(),
  ]);

  return { notes, operators, equipments };
}

/**
 * Create a new workcard.
 */
export async function createWorkcard(
  input: CreateWorkcardInput,
): Promise<void> {
  const [Wyear, WMonth, WDay] = input.Date.split("-").map(Number);
  const duration = calculateDuration(input.EndTime, input.StartTime);

  await sqlTransaction(async (request) => {
    request.input("Wyear", Wyear);
    request.input("WMonth", WMonth);
    request.input("WDay", WDay);
    request.input("StartTime", input.StartTime);
    request.input("EndTime", input.EndTime);
    request.input("OperatorId", input.OperatorId);
    request.input("CodeAction", input.CodeAction);
    request.input("Duration", duration);
    request.input("Note", input.Note);
    request.input("WorkingCardId", input.WorkingCardId);
    request.input("Bukva", 1);
    request.input("EqmtId", input.EqmtId);

    await request.query(`
      INSERT INTO [Hermes].[dbo].[RabKartiData]
        ([Wyear], [WMonth], [WDay], [StartTime], [EndTime], [OperatorId],
         [CodeAction], [Duration], [Note], [WorkingCardId], [Bukva], [EqmtId])
      VALUES
        (@Wyear, @WMonth, @WDay, @StartTime, @EndTime, @OperatorId,
         @CodeAction, @Duration, @Note, @WorkingCardId, @Bukva, @EqmtId)
    `);
  });
}

/**
 * Delete a workcard by ID.
 */
export async function deleteWorkcard(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      DELETE FROM [Hermes].[dbo].[RabKartiData]
      WHERE [ID] = @id
    `);
  });
}
