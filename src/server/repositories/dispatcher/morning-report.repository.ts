import { sqlQuery, sqlQueryOne, sqlTransaction } from "@/server/database/db";
import type {
  MorningReport,
  CreateMorningReportInput,
  UpdateMorningReportInput,
  SendMorningReportInput,
} from "@/types/dispatcher";

/**
 * Get all morning reports.
 */
export async function getMorningReports(): Promise<MorningReport[]> {
  return sqlQuery<MorningReport>(`
    SELECT [ID],
           CONVERT(NVARCHAR, CAST([ReportDate] AS DATE), 120) AS [ReportDate],
           [StartedFromDispatcher],
           [CompletedFromDispatcher],
           CONVERT(NVARCHAR, [CompletedOn], 120) AS [CompletedOn],
           [ReportBody],
           CONVERT(NVARCHAR, [SentOn], 120) AS [SentOn],
           [SentFrom]
    FROM [ELLDBAdmins].[dbo].[Dispatchers_MorningReport] 
    WHERE id > 4
    ORDER BY ID DESC
  `);
}

/**
 * Get a morning report by ID.
 */
export async function getMorningReportById(
  id: number,
): Promise<MorningReport | null> {
  const results = await sqlQuery<MorningReport>(
    `
    SELECT [ID],
           CONVERT(NVARCHAR, CAST([ReportDate] AS DATE), 120) AS [ReportDate],
           [StartedFromDispatcher],
           [CompletedFromDispatcher],
           CONVERT(NVARCHAR, [CompletedOn], 120) AS [CompletedOn],
           [ReportBody],
           CONVERT(NVARCHAR, [SentOn], 120) AS [SentOn]
    FROM [ELLDBAdmins].[dbo].[Dispatchers_MorningReport] 
    WHERE ID = @id
  `,
    { id },
  );
  return results[0] ?? null;
}

/**
 * Get the morning report template.
 */
export async function getMorningReportTemplate(): Promise<string> {
  const result = await sqlQueryOne<{ ReportBody: string }>(`
    SELECT [ReportBody]
    FROM [ELLDBAdmins].[dbo].[Dispatchers_MorningReport] 
    WHERE id = 4
  `);
  return result?.ReportBody ?? "";
}

/**
 * Create a new morning report.
 */
export async function createMorningReport(
  input: CreateMorningReportInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("ReportDate", input.ReportDate);
    request.input("StartedFromDispatcher", input.StartedFromDispatcher);
    request.input("ReportBody", input.ReportBody);

    await request.query(`
      INSERT INTO [ELLDBAdmins].[dbo].[Dispatchers_MorningReport] (
        [ReportDate], [StartedFromDispatcher], [ReportBody]
      )
      VALUES (@ReportDate, @StartedFromDispatcher, @ReportBody)
    `);
  });
}

/**
 * Update an existing morning report.
 */
export async function updateMorningReport(
  id: number,
  input: UpdateMorningReportInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("CompletedFromDispatcher", input.CompletedFromDispatcher);
    request.input("CompletedOn", input.CompletedOn);
    request.input("ReportBody", input.ReportBody);

    await request.query(`
      UPDATE [ELLDBAdmins].[dbo].[Dispatchers_MorningReport]
      SET [CompletedFromDispatcher] = @CompletedFromDispatcher,
          [CompletedOn] = @CompletedOn,
          [ReportBody] = @ReportBody
      WHERE ID = @id
    `);
  });
}

/**
 * Mark a morning report as sent.
 */
export async function sendMorningReport(
  id: number,
  input: SendMorningReportInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("SentOn", input.SentOn);
    request.input("SentFrom", input.SentFrom);

    await request.query(`
      UPDATE [ELLDBAdmins].[dbo].[Dispatchers_MorningReport]
      SET [SentOn] = @SentOn,
          [SentFrom] = @SentFrom
      WHERE ID = @id
    `);
  });
}

