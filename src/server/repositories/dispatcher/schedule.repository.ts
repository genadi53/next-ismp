import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  DispatcherSchedule,
  CreateDispatcherScheduleInput,
} from "./types.schedule";

/**
 * Get dispatcher schedule for the current month.
 */
export async function getDispatcherSchedule(): Promise<DispatcherSchedule[]> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return sqlQuery<DispatcherSchedule>(
    `
    SELECT [Id],
           [Date],
           [Shift],
           [dispatcherID],
           [Name],
           [LoginName],
           [lrd]
    FROM [ELLDBAdmins].[dbo].[DispatchersGrafic]
    WHERE [Date] LIKE @yearMonth + '-%'
    ORDER BY [Date], [Shift] DESC
  `,
    { yearMonth },
  );
}

/**
 * Create dispatcher schedule for a month.
 * Deletes existing schedule for the month and inserts new entries.
 */
export async function createDispatcherSchedule(
  schedule: CreateDispatcherScheduleInput[],
): Promise<void> {
  if (schedule.length === 0) {
    throw new Error("Schedule cannot be empty");
  }

  // 1. Check the format yyyy-mm-dd
  const regEx = /^\d{4}-\d{2}-\d{2}$/;

  const firstSchedule = schedule[0];
  if (!firstSchedule?.Date || !regEx.exec(firstSchedule.Date)) {
    throw new Error("Invalid date format passed");
  }

  const yearMonth = firstSchedule.Date.substring(0, 7); // "2025-12"

  await sqlTransaction(async (request) => {
    // Delete existing schedule for the month
    request.input("yearMonth", yearMonth);
    await request.query(`
      DELETE FROM [ELLDBAdmins].[dbo].[DispatchersGrafic]
      WHERE [Date] LIKE @yearMonth + '%'
    `);

    // Insert new schedule entries
    for (const [i, row] of schedule.entries()) {
      const suffix = `_${i}`;

      request.input(`Date${suffix}`, row.Date);
      request.input(`Shift${suffix}`, row.Shift);
      request.input(`dispatcherID${suffix}`, row.dispatcherID);
      request.input(`Name${suffix}`, row.Name);
      request.input(`LoginName${suffix}`, row.LoginName);

      await request.query(`
        INSERT INTO [ELLDBAdmins].[dbo].[DispatchersGrafic] (
          [Date], [Shift], [dispatcherID], [Name], [LoginName]
        )
        VALUES (@Date${suffix}, @Shift${suffix}, @dispatcherID${suffix}, @Name${suffix}, @LoginName${suffix})
      `);
    }
  });
}
