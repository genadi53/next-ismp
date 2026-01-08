import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type { HermesZarabotki, CreateZarabotkiInput } from "./types.zarabotki";

/**
 * Get zarabotki for a specific year and month.
 * Defaults to previous month if not specified.
 */
export async function getZarabotki(
  year?: number,
  month?: number,
): Promise<HermesZarabotki[]> {
  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  // Default to previous month, or current month if January
  const targetMonth =
    month ?? (now.getMonth() === 0 ? now.getMonth() + 1 : now.getMonth());

  return sqlQuery<HermesZarabotki>(
    `
    SELECT [Година], [Месец], [Цех], [Звено],
           [Код_на_машина], [Показател], [Количество_показател], [Общо_сума]
    FROM [Hermes].[dbo].[ZarabotkiShovelsDrills]
    WHERE [Година] = @year AND [Месец] = @month
    ORDER BY [Година] DESC, [Месец] DESC
  `,
    { year: targetYear, month: targetMonth },
  );
}

/**
 * Create zarabotki data for a specific year and month.
 * First deletes existing data for the period and then inserts new data.
 */
export async function createZarabotki(
  data: CreateZarabotkiInput[],
): Promise<void> {
  if (data.length === 0) {
    throw new Error("Data list cannot be empty");
  }

  const { Година, Месец } = data[0]!;

  await sqlTransaction(async (request) => {
    // Delete existing data for this year/month
    request.input("deleteYear", Година);
    request.input("deleteMonth", Месец);
    await request.query(`
      DELETE FROM [Hermes].[dbo].[ZarabotkiShovelsDrills]
      WHERE [Година] = @deleteYear AND [Месец] = @deleteMonth
    `);

    // Insert new data
    for (let i = 0; i < data.length; i++) {
      const item = data[i]!;
      const suffix = `_${i}`;

      request.input(`Year${suffix}`, item.Година);
      request.input(`Month${suffix}`, item.Месец);
      request.input(`Department${suffix}`, item.Цех);
      request.input(`Zveno${suffix}`, item.Звено);
      request.input(`Machine${suffix}`, item.Код_на_машина);
      request.input(`Indicator${suffix}`, item.Показател);
      request.input(`Indicator_Quantity${suffix}`, item.Количество_показател);
      request.input(`Total_Sum${suffix}`, item.Общо_сума);

      await request.query(`
        INSERT INTO [Hermes].[dbo].[ZarabotkiShovelsDrills]
          ([Година], [Месец], [Цех], [Звено], [Код_на_машина], [Показател], [Количество_показател], [Общо_сума])
        VALUES
          (@Year${suffix}, @Month${suffix}, @Department${suffix}, @Zveno${suffix}, 
           @Machine${suffix}, @Indicator${suffix}, @Indicator_Quantity${suffix}, @Total_Sum${suffix})
      `);
    }
  });
}

// /**
//  * Get zarabotki for a specific year and month.
//  * Defaults to previous month if not specified.
//  */
// export async function getZarabotki(
//   year?: number,
//   month?: number,
// ): Promise<HermesZarabotki[]> {
//   const now = new Date();
//   const targetYear = year ?? now.getFullYear();
//   // Default to previous month, or current month if January
//   const targetMonth =
//     month ?? (now.getMonth() === 0 ? now.getMonth() + 1 : now.getMonth());

//   return sqlQuery<HermesZarabotki>(
//     `
//     SELECT [Year], [Month], [Department], [Zveno],
//            [Machine], [Indicator], [Indicator_Quantity], [Total_Sum]
//     FROM [Hermes].[dbo].[ZarabotkiShovelsDrills]
//     WHERE [Year] = @year AND [Month] = @month
//     ORDER BY [Year] DESC, [Month] DESC
//   `,
//     { year: targetYear, month: targetMonth },
//   );
// }

// /**
//  * Create zarabotki data for a specific year and month.
//  * First deletes existing data for the period and then inserts new data.
//  */
// export async function createZarabotki(
//   data: CreateZarabotkiInput[],
// ): Promise<void> {
//   if (data.length === 0) {
//     throw new Error("Data list cannot be empty");
//   }

//   const { Year, Month } = data[0]!;

//   await sqlTransaction(async (request) => {
//     // Delete existing data for this year/month
//     request.input("deleteYear", Year);
//     request.input("deleteMonth", Month);
//     await request.query(`
//       DELETE FROM [Hermes].[dbo].[ZarabotkiShovelsDrills]
//       WHERE [Year] = @deleteYear AND [Month] = @deleteMonth
//     `);

//     // Insert new data
//     for (let i = 0; i < data.length; i++) {
//       const item = data[i]!;
//       const suffix = `_${i}`;

//       request.input(`Year${suffix}`, item.Year);
//       request.input(`Month${suffix}`, item.Month);
//       request.input(`Department${suffix}`, item.Department);
//       request.input(`Zveno${suffix}`, item.Zveno);
//       request.input(`Machine${suffix}`, item.Machine);
//       request.input(`Indicator${suffix}`, item.Indicator);
//       request.input(`Indicator_Quantity${suffix}`, item.Indicator_Quantity);
//       request.input(`Total_Sum${suffix}`, item.Total_Sum);

//       await request.query(`
//         INSERT INTO [Hermes].[dbo].[ZarabotkiShovelsDrills]
//           ([Year], [Month], [Department], [Zveno], [Machine], [Indicator], [Indicator_Quantity], [Total_Sum])
//         VALUES
//           (@Year${suffix}, @Month${suffix}, @Department${suffix}, @Zveno${suffix},
//            @Machine${suffix}, @Indicator${suffix}, @Indicator_Quantity${suffix}, @Total_Sum${suffix})
//       `);
//     }
//   });
// }
