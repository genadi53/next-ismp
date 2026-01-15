import { sqlQuery } from "@/server/database/db";

/**
 * Get the average cycle/spot/queue time for truck.
 * The double avg is for more accurate results from the shift paths.
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
