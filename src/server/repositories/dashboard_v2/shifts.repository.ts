import { sqlQuery, sqlQueryOne } from "@/server/database/db";

/**
 * Get the shift ID range for a given period.
 */
export async function getShiftIdsForPeriod(
  period: "current" | "today" | "yesterday" | "month",
): Promise<{ StartShiftId: number; EndShiftId: number }[]> {
  switch (period) {
    case "current":
      return sqlQuery<{ StartShiftId: number; EndShiftId: number }>(
        `
        SELECT MAX(ShiftId) as StartShiftId, MAX(ShiftId) as EndShiftId 
        FROM [ELLOperational].common.shiftinfo
        WHERE ShiftStartDate = CAST(GETDATE() as date)
        `,
        undefined,
        "moddb",
      );

    case "today":
      return sqlQuery<{ StartShiftId: number; EndShiftId: number }>(
        `
        SELECT MIN(ShiftId) as StartShiftId, MAX(ShiftId) as EndShiftId 
        FROM [ELLOperational].common.shiftinfo
        WHERE ShiftStartDate = CAST(GETDATE() as date)
        `,
        undefined,
        "moddb",
      );

    case "yesterday":
      return sqlQuery<{ StartShiftId: number; EndShiftId: number }>(
        `
        SELECT MIN(ShiftId) as StartShiftId, MAX(ShiftId) as EndShiftId 
        FROM [ELLOperational].common.shiftinfo
        WHERE ShiftStartDate = CAST(DATEADD(DAY, -1, GETDATE()) as date)
        `,
        undefined,
        "moddb",
      );

    case "month":
      return sqlQuery<{ StartShiftId: number; EndShiftId: number }>(
        `
        DECLARE @YearMonth nvarchar(4),
        @DateFormatted nvarchar(6) = FORMAT(GETDATE(), 'yyMMdd') 

        IF RIGHT(@DateFormatted, 2) <> N'01'
        SET @YearMonth = LEFT(@DateFormatted, 4)
        ELSE 
        SET @YearMonth = LEFT(FORMAT(DATEADD(MONTH, -1, GETDATE()), 'yyMMdd') , 4)

        SELECT MIN(ShiftId) as StartShiftId, MAX(ShiftId) as EndShiftId
        FROM [ELLOperational].common.shiftinfo
        WHERE LEFT(ShiftId, 4) = @YearMonth
        `,
        undefined,
        "moddb",
      );
  }
}

/**
 * Get all shift IDs.
 */
export async function getAllShifts(): Promise<
  { ShiftId: number; FullShiftName: string }[]
> {
  return sqlQuery<{ ShiftId: number; FullShiftName: string }>(
    `
    SELECT ShiftId, FullShiftName
    FROM [ELLOperational].common.shiftinfo
    ORDER BY ShiftId DESC
    `,
    undefined,
    "moddb",
  );
}

/**
 * Get the current shift ID (MAX ShiftId for today's date).
 */
export async function getCurrentShiftId(): Promise<number | null> {
  const result = await sqlQueryOne<{ ShiftId: number }>(
    `
    SELECT MAX(ShiftId) as ShiftId
    FROM [ELLOperational].common.shiftinfo
    WHERE ShiftStartDate = CAST(GETDATE() as date)
    `,
    undefined,
    "moddb",
  );
  return result?.ShiftId ?? null;
}
