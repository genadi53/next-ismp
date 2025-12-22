import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type { MonthChecklist, CreateMonthChecklistInput } from "@/types/ismp";

/**
 * Get month checklist for a specific year/month.
 * If not specified, defaults to the current year/month.
 */
export async function getMonthChecklist(
  yearMonth?: number,
): Promise<MonthChecklist[]> {
  let targetYearMonth = yearMonth;

  if (!targetYearMonth) {
    const now = new Date();
    // Format as YYMM (e.g., 2412 for December 2024)
    targetYearMonth = parseInt(
      `${now.getFullYear().toString().slice(2)}${now.getMonth() + 1}`,
    );
  }

  return sqlQuery<MonthChecklist>(
    `
    SELECT [Id],
           [YearMonth],
           [Task],
           [FinishedBy],
           [lrd]
    FROM [ISMP].[dbo].[MonthChecklist]
    WHERE YearMonth = @yearMonth
  `,
    { yearMonth: targetYearMonth },
  );
}

/**
 * Create month checklist tasks.
 */
export async function createMonthChecklistTasks(
  tasks: CreateMonthChecklistInput[],
): Promise<void> {
  await sqlTransaction(async (request) => {
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]!;
      const suffix = `_${i}`;

      request.input(`YearMonth${suffix}`, task.YearMonth);
      request.input(`Task${suffix}`, task.Task);
      request.input(`FinishedBy${suffix}`, task.FinishedBy);

      await request.query(`
        INSERT INTO [ISMP].[dbo].[MonthChecklist] ([YearMonth], [Task], [FinishedBy])
        VALUES (@YearMonth${suffix}, @Task${suffix}, @FinishedBy${suffix})
      `);
    }
  });
}

