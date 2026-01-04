import { sqlQuery, sqlQueryOne, sqlTransaction } from "@/server/database/db";
import type {
  PrestartCheck,
  CreatePrestartCheckInput,
  CompletePrestartCheckInput,
  PrestartStatus,
} from "./types.prestart";

/**
 * Check for unfinished prestart checks.
 */
export async function checkUnfinishedPrestart(): Promise<number> {
  const result = await sqlQueryOne<{ countUnfinishedPrestart: number }>(`
    SELECT COUNT(*) as countUnfinishedPrestart
    FROM [ISMP].[dsp].[PrestartCheck] as dcSupl
    WHERE [EndDate] is NULL
  `);
  return result?.countUnfinishedPrestart ?? 0;
}

/**
 * Get current prestart check for a dispatcher.
 */
export async function getCurrentPrestartCheck(
  dispatcher: string,
): Promise<PrestartCheck | null> {
  const results = await sqlQuery<PrestartCheck>(
    `
    SELECT [ID],
           CONVERT(NVARCHAR, CAST([StartDate] AS DATE), 120) AS [StartDate],
           CONVERT(NVARCHAR, CAST([EndDate] AS DATE), 120) AS [EndDate],
           [Dispatcher],
           [EndDispatcher],
           [Shift],
           shInf.FullShiftName
    FROM [ISMP].[dsp].[PrestartCheck] as PScheck 
    INNER JOIN [ELLOperational].[common].[ShiftInfo] as shInf
        ON shInf.ShiftId = PScheck.Shift
    WHERE [EndDate] is NULL AND [Dispatcher] = @dispatcher
  `,
    { dispatcher },
  );
  return results[0] ?? null;
}

/**
 * Create a new prestart check.
 */
export async function createPrestartCheck(
  input: CreatePrestartCheckInput,
): Promise<number> {
  let newPrestartId = 0;

  await sqlTransaction(async (request) => {
    request.input("Dispatcher", input.Dispatcher);
    request.input("Shift", input.Shift);

    // Insert new prestart check
    const insertResult = await request.query(`
      INSERT INTO [ISMP].[dsp].[PrestartCheck] (
        [StartDate], [Dispatcher], [Shift], [lrd]
      )
      VALUES (
        GETDATE(), @Dispatcher, @Shift, GETDATE()
      );
      SELECT SCOPE_IDENTITY() as newPrestartId;
    `);

    if (insertResult && insertResult.recordset && insertResult.recordset[0]) {
      newPrestartId = insertResult.recordset[0].newPrestartId;
    }
  });

  return newPrestartId;
}

/**
 * Complete all unfinished prestart checks.
 */
export async function completeOldPrestartChecks(
  input: CompletePrestartCheckInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("EndDispatcher", input.EndDispatcher);

    await request.query(`
      UPDATE [ISMP].[dsp].[PrestartCheck]
      SET [EndDate] = GETDATE(),
          [EndDispatcher] = @EndDispatcher,
          [lrd] = GETDATE()
      WHERE [EndDate] is NULL
    `);
  });
}

/**
 * End a specific prestart check.
 */
export async function endPrestartCheck(
  id: number,
  input: CompletePrestartCheckInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("EndDispatcher", input.EndDispatcher);

    await request.query(`
      UPDATE [ISMP].[dsp].[PrestartCheck]
      SET [EndDate] = GETDATE(),
          [EndDispatcher] = @EndDispatcher,
          [lrd] = GETDATE()
      WHERE ID = @id
    `);
  });
}

/**
 * Get prestart status (unfinished checks and current prestart).
 */
export async function getPrestartStatus(
  dispatcher: string,
): Promise<PrestartStatus> {
  const unfinishedCount = await checkUnfinishedPrestart();
  const currentPrestart = await getCurrentPrestartCheck(dispatcher);

  return {
    hasUnfinished: unfinishedCount > 0,
    currentPrestart,
  };
}

/**
 * Get the current shift ID.
 */
export async function getCurrentShiftId(): Promise<number> {
  const result = await sqlQueryOne<{ ShiftId: number }>(`
    SELECT MAX(ShiftId) as ShiftId
    FROM [ELLOperational].[common].[ShiftInfo]
  `);
  return result?.ShiftId ?? 1;
}

