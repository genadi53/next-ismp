import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type { PlanShovels, CreatePlanShovelsInput } from "./types.plan-shovels";

/**
 * Get shovel plan for the current date.
 */
export async function getMonthPlanShovels(): Promise<PlanShovels[]> {
  const date = new Date().toISOString().split("T")[0];

  return sqlQuery<PlanShovels>(
    `
    SELECT 
      CONCAT(YEAR([PlanMonthDay]),
        CASE 
          WHEN MONTH([PlanMonthDay]) < 10 THEN CONCAT('-0', MONTH([PlanMonthDay]))
          ELSE CONCAT('-', MONTH([PlanMonthDay]))
        END
      ) AS PlanMonth,
      [Object],
      [Horizont],
      [MMtype],
      [Shovel],
      ROUND(SUM([PlanVol]), 0) AS [PlanVol],
      ROUND(SUM([PlanMass]), 0) AS [PlanMass],
      [userAdded]
    FROM [ELLDBAdmins].[dbo].[MesechePlan_shovels]
    WHERE [PlanMonthDay] = (
      SELECT MAX([PlanMonthDay])
      FROM [ELLDBAdmins].[dbo].[MesechePlan_shovels]
      WHERE [PlanMonthDay] = @date
    )
    GROUP BY 
      CONCAT(YEAR([PlanMonthDay]),
        CASE 
          WHEN MONTH([PlanMonthDay]) < 10 THEN CONCAT('-0', MONTH([PlanMonthDay]))
          ELSE CONCAT('-', MONTH([PlanMonthDay]))
        END
      ),
      [Object],
      [Horizont],
      [MMtype],
      [Shovel],
      [userAdded]
    ORDER BY 
      PlanMonth, Shovel, Horizont, [userAdded]
  `,
    { date },
  );
}

/**
 * Create shovel plan entries.
 * Deletes existing entries for the month before inserting.
 */
export async function createMonthPlanShovels(
  plans: CreatePlanShovelsInput[],
): Promise<void> {
  if (plans.length === 0) {
    throw new Error("Plans array cannot be empty");
  }

  await sqlTransaction(async (request) => {
    // Delete existing plans for this month
    request.input("planMonthDay", plans[0]!.PlanMonthDay);

    await request.query(`
      DELETE FROM [ELLDBAdmins].[dbo].[MesechePlan_shovels] 
      WHERE [PlanMonthDay] LIKE LEFT(@planMonthDay, 7) + '%'
    `);

    // Insert each plan
    for (let i = 0; i < plans.length; i++) {
      const row = plans[i]!;
      const s = `_${i}`;

      request.input(`PlanMonthDay${s}`, row.PlanMonthDay);
      request.input(`Object${s}`, row.Object);
      request.input(`Horizont${s}`, row.Horizont);
      request.input(`MMtype${s}`, row.MMtype);
      request.input(`Shovel${s}`, row.Shovel);
      request.input(`DumpLocation${s}`, row.DumpLocation);
      request.input(`PlanVol${s}`, row.PlanVol);
      request.input(`PlanMass${s}`, row.PlanMass ?? 0);
      request.input(`Etap${s}`, row.Etap);
      request.input(`userAdded${s}`, row.userAdded ?? "system");

      await request.query(`
        INSERT INTO [ELLDBAdmins].[dbo].[MesechePlan_shovels] (
          [PlanMonthDay], [Object], [Horizont], [MMtype], [Shovel],
          [DumpLocation], [PlanVol], [PlanMass], [Etap], [userAdded]
        )
        VALUES (
          @PlanMonthDay${s}, @Object${s}, @Horizont${s}, @MMtype${s}, @Shovel${s},
          @DumpLocation${s}, @PlanVol${s}, @PlanMass${s}, @Etap${s}, @userAdded${s}
        )
      `);
    }
  });
}

