import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  RequestRepair,
  CreateRequestRepairInput,
  ExcavatorInfo,
} from "./types.repairs";

/**
 * Get excavator repair reasons.
 */
export async function getExcavatorReasons(): Promise<string[]> {
  const results = await sqlQuery<{ Reason: string }>(`
    SELECT DISTINCT [Reason]
    FROM [ELLDBAdmins].[remonti].[RequestsRemonti]
    WHERE EqmtType = '1' OR EqmtType = 'NULL' OR EqmtType IS NULL
    ORDER BY Reason
  `);
  return results.map((r) => r.Reason);
}

/**
 * Get drill repair reasons.
 */
export async function getDrillReasons(): Promise<string[]> {
  const results = await sqlQuery<{ Reason: string }>(`
    SELECT DISTINCT [Reason]
    FROM [ELLDBAdmins].[remonti].[RequestsRemonti]
    WHERE EqmtType = '2' OR EqmtType = 'NULL' OR EqmtType IS NULL
    ORDER BY Reason
  `);
  return results.map((r) => r.Reason);
}

/**
 * Get all excavators.
 */
export async function getExcavators(): Promise<ExcavatorInfo[]> {
  return sqlQuery<ExcavatorInfo>(`
    SELECT [FieldId] 
    FROM [DBADMINS].ELLOperational.dbo.PITExcav 
    WHERE [Fieldid] NOT IN ('2B998', '2BРЦ')
    ORDER BY [FieldId]
  `);
}

/**
 * Get repair requests.
 */
export async function getRequestRepairs(
  date?: string,
): Promise<RequestRepair[]> {
  if (date) {
    return sqlQuery<RequestRepair>(
      `
      SELECT [ID],
             CONVERT(NVARCHAR, [RequestDate], 120) AS [RequestDate],
             [Equipment],
             [EquipmentType],
             [RequestRemont],
             [DrillHoles_type],
             CONVERT(NVARCHAR, [SentReportOn], 120) AS SentReportOn,
             [addUser],
             CONVERT(NVARCHAR, [lrd], 120) AS lrd
      FROM [ELLDBAdmins].[remonti].[RequestRemontiDate]
      WHERE RequestDate = @date
      ORDER BY [RequestDate] DESC
    `,
      { date },
    );
  }

  return sqlQuery<RequestRepair>(`
    SELECT TOP 50 [ID],
           CONVERT(NVARCHAR, [RequestDate], 120) AS [RequestDate],
           [Equipment],
           [EquipmentType],
           [RequestRemont],
           [DrillHoles_type],
           CONVERT(NVARCHAR, [SentReportOn], 120) AS SentReportOn,
           [addUser],
           CONVERT(NVARCHAR, [lrd], 120) AS lrd
    FROM [ELLDBAdmins].[remonti].[RequestRemontiDate]
    ORDER BY [RequestDate] DESC
  `);
}

/**
 * Create repair requests.
 */
export async function createRequestRepairs(
  repairs: CreateRequestRepairInput[],
): Promise<void> {
  await sqlTransaction(async (request) => {
    for (let i = 0; i < repairs.length; i++) {
      const repair = repairs[i]!;
      const suffix = `_${i}`;

      request.input(`RequestDate${suffix}`, repair.RequestDate);
      request.input(`Equipment${suffix}`, repair.Equipment);
      request.input(`EquipmentType${suffix}`, repair.EquipmentType);
      request.input(`RequestRemont${suffix}`, repair.RequestRemont);
      request.input(`DrillHoles_type${suffix}`, repair.DrillHoles_type);
      request.input(`userAdded${suffix}`, repair.userAdded ?? "system");

      await request.query(`
        INSERT INTO [ELLDBAdmins].[remonti].[RequestRemontiDate] (
          [RequestDate], [Equipment], [EquipmentType], [RequestRemont], [addUser], [DrillHoles_type]
        )
        VALUES (@RequestDate${suffix}, @Equipment${suffix}, @EquipmentType${suffix}, @RequestRemont${suffix}, 
        @userAdded${suffix}, @DrillHoles_type${suffix})
      `);
    }
  });
}

/**
 * Mark repair requests as sent for a specific date.
 */
export async function markRepairRequestsSent(date: string): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("date", date);
    await request.query(`
      UPDATE [ELLDBAdmins].[remonti].[RequestRemontiDate]
      SET [SentReportOn] = GETDATE()
      WHERE [RequestDate] = @date
    `);
  });
}
