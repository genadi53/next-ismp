import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type { PlanNP, CreatePlanNPInput } from "./types.plan-np";

/**
 * Get natural plan (НП) for the current date.
 */
export async function getMonthPlanNP(): Promise<PlanNP[]> {
  const date = new Date().toISOString().split("T")[0];

  return sqlQuery<PlanNP>(
    `
    SELECT 
      CONCAT(YEAR([PlanMonthDay]),
        CASE 
          WHEN MONTH([PlanMonthDay]) < 10 THEN CONCAT('-0', MONTH([PlanMonthDay])) 
          ELSE CONCAT('-', MONTH([PlanMonthDay])) 
        END
      ) AS PlanMonth,
      [Object],
      SUM([PlanVolOre]) AS [PlanVolOre],
      SUM([PlanMassOre]) AS [PlanMassOre],
      AVG([percent_ore]) AS [percent_ore],
      SUM([Cu_t]) AS [Cu_t],
      SUM([PlanVolOreFromDepo]) AS [PlanVolOreFromDepo],
      SUM([PlanMassOreFromDepo]) AS [PlanMassOreFromDepo],
      AVG([percent_oreFromDepo]) AS [percent_oreFromDepo],
      SUM([Cu_t_FromDepo]) AS [Cu_t_FromDepo],
      SUM([PlanVolIBRFromDepo]) AS [PlanVolIBRFromDepo],
      SUM([PlanMassIBRFromDepo]) AS [PlanMassIBRFromDepo],
      AVG([percent_IBRFromDepo]) AS [percent_IBRFromDepo],
      SUM([Cu_t_IBRFromDepo]) AS [Cu_t_IBRFromDepo],
      SUM([PlanVolOreKet]) AS PlanVolOreKet,
      SUM([PlanMassOreKet]) AS PlanMassOreKet,
      AVG([percent_oreKet]) AS percent_oreKet,
      SUM([Cu_t_Ket]) AS Cu_t_Ket,
      SUM([PlanVolOreDepo]) AS PlanVolOreDepo,
      SUM([PlanMassOreDepo]) AS PlanMassOreDepo,
      AVG([percent_oreDepo]) AS percent_oreDepo,
      SUM([Cu_t_Depo]) AS Cu_t_Depo,
      SUM([PlanVolIBRToDepo]) AS PlanVolIBRToDepo,
      SUM([PlanMassIBRToDepo]) AS PlanMassIBRToDepo,
      AVG([percent_IBRToDepo]) AS percent_IBRToDepo,
      SUM([Cu_t_IBRToDepo]) AS Cu_t_IBRToDepo,
      SUM([PlanVolWaste]) AS [PlanVolWaste],
      SUM([PlanMassWaste]) AS [PlanMassWaste],
      SUM([PlanVolTot]) AS [PlanVolTot],
      SUM([PlanMassTot]) AS [PlanMassTot],
      SUM([Planvol]) AS [Planvol],
      SUM([PlanMass]) AS [PlanMass],
      SUM([PlanTkmOre]) AS [PlanTkmOre],
      AVG([AvgkmOre]) AS [AvgkmOre],
      SUM([PlanTkmWaste]) AS [PlanTkmWaste],
      AVG([AvgkmWaste]) AS [AvgkmWaste],
      SUM([PlanTkm]) AS [PlanTkm],
      AVG([Avgkm]) AS [Avgkm],
      [userAdded]
    FROM [ELLDBAdmins].[dbo].[MesechePlan_of]
    WHERE [PlanMonthDay] = (
      SELECT MAX([PlanMonthDay])
      FROM [ELLDBAdmins].[dbo].[MesechePlan_of]
      WHERE [PlanMonthDay] = @date
    )
    AND [PlanType] = N'НП'
    GROUP BY 
      CONCAT(YEAR([PlanMonthDay]),
        CASE 
          WHEN MONTH([PlanMonthDay]) < 10 THEN CONCAT('-0', MONTH([PlanMonthDay])) 
          ELSE CONCAT('-', MONTH([PlanMonthDay])) 
        END
      ),
      [Object],
      [userAdded]
  `,
    { date },
  );
}

/**
 * Create natural plan entries.
 * Deletes existing entries for the month and plan type before inserting.
 */
export async function createMonthPlanNP(
  plans: CreatePlanNPInput[],
): Promise<void> {
  if (plans.length === 0) {
    throw new Error("Plans array cannot be empty");
  }

  await sqlTransaction(async (request) => {
    // Delete existing plans for this month and type
    request.input("planMonthDay", plans[0]!.PlanMonthDay);
    request.input("planType", plans[0]!.PlanType);

    await request.query(`
      DELETE FROM [ELLDBAdmins].[dbo].[MesechePlan_of] 
      WHERE [PlanMonthDay] LIKE LEFT(@planMonthDay, 7) + '%'
        AND PlanType = @planType
    `);

    // Insert each plan
    for (let i = 0; i < plans.length; i++) {
      const row = plans[i]!;
      const s = `_${i}`;

      request.input(`PlanMonthDay${s}`, row.PlanMonthDay);
      request.input(`PlanType${s}`, row.PlanType);
      request.input(`Object${s}`, row.Object);
      request.input(`PlanVolOre${s}`, row.PlanVolOre);
      request.input(`PlanMassOre${s}`, row.PlanMassOre);
      request.input(`percent_ore${s}`, row.percent_ore);
      request.input(`Cu_t${s}`, row.Cu_t);
      request.input(`PlanVolOreKet${s}`, row.PlanVolOreKet);
      request.input(`PlanMassOreKet${s}`, row.PlanMassOreKet);
      request.input(`percent_oreKet${s}`, row.percent_oreKet);
      request.input(`Cu_t_Ket${s}`, row.Cu_t_Ket);
      request.input(`PlanVolOreFromDepo${s}`, row.PlanVolOreFromDepo);
      request.input(`PlanMassOreFromDepo${s}`, row.PlanMassOreFromDepo);
      request.input(`percent_oreFromDepo${s}`, row.percent_oreFromDepo);
      request.input(`Cu_t_FromDepo${s}`, row.Cu_t_FromDepo);
      request.input(`PlanVolIBRFromDepo${s}`, row.PlanVolIBRFromDepo);
      request.input(`PlanMassIBRFromDepo${s}`, row.PlanMassIBRFromDepo);
      request.input(`percent_IBRFromDepo${s}`, row.percent_IBRFromDepo);
      request.input(`Cu_t_IBRFromDepo${s}`, row.Cu_t_IBRFromDepo);
      request.input(`PlanVolOreDepo${s}`, row.PlanVolOreDepo);
      request.input(`PlanMassOreDepo${s}`, row.PlanMassOreDepo);
      request.input(`percent_oreDepo${s}`, row.percent_oreDepo);
      request.input(`Cu_t_Depo${s}`, row.Cu_t_Depo);
      request.input(`PlanVolIBRToDepo${s}`, row.PlanVolIBRToDepo);
      request.input(`PlanMassIBRToDepo${s}`, row.PlanMassIBRToDepo);
      request.input(`percent_IBRToDepo${s}`, row.percent_IBRToDepo);
      request.input(`Cu_t_IBRToDepo${s}`, row.Cu_t_IBRToDepo);
      request.input(`PlanVolWaste${s}`, row.PlanVolWaste);
      request.input(`PlanMassWaste${s}`, row.PlanMassWaste);
      request.input(`PlanVolTot${s}`, row.PlanVolTot);
      request.input(`PlanMassTot${s}`, row.PlanMassTot);
      request.input(`Planvol${s}`, row.Planvol);
      request.input(`PlanMass${s}`, row.PlanMass);
      request.input(`PlanTkmOre${s}`, row.PlanTkmOre);
      request.input(`AvgkmOre${s}`, row.AvgkmOre);
      request.input(`PlanTkmWaste${s}`, row.PlanTkmWaste);
      request.input(`AvgkmWaste${s}`, row.AvgkmWaste);
      request.input(`PlanTkm${s}`, row.PlanTkm);
      request.input(`Avgkm${s}`, row.Avgkm);
      request.input(`userAdded${s}`, row.userAdded);

      await request.query(`
        INSERT INTO [ELLDBAdmins].[dbo].[MesechePlan_of] (
          [PlanMonthDay], [PlanType], [Object], [PlanVolOre], [PlanMassOre],
          [percent_ore], [Cu_t], [PlanVolOreKet], [PlanMassOreKet], [percent_oreKet],
          [Cu_t_Ket], [PlanVolOreFromDepo], [PlanMassOreFromDepo], [percent_oreFromDepo],
          [Cu_t_FromDepo], [PlanVolIBRFromDepo], [PlanMassIBRFromDepo], [percent_IBRFromDepo],
          [Cu_t_IBRFromDepo], [PlanVolOreDepo], [PlanMassOreDepo], [percent_oreDepo],
          [Cu_t_Depo], [PlanVolIBRToDepo], [PlanMassIBRToDepo], [percent_IBRToDepo],
          [Cu_t_IBRToDepo], [PlanVolWaste], [PlanMassWaste], [PlanVolTot], [PlanMassTot],
          [Planvol], [PlanMass], [PlanTkmOre], [AvgkmOre], [PlanTkmWaste], [AvgkmWaste],
          [PlanTkm], [Avgkm], [userAdded]
        )
        VALUES (
          @PlanMonthDay${s}, @PlanType${s}, @Object${s}, @PlanVolOre${s}, @PlanMassOre${s},
          @percent_ore${s}, @Cu_t${s}, @PlanVolOreKet${s}, @PlanMassOreKet${s}, @percent_oreKet${s},
          @Cu_t_Ket${s}, @PlanVolOreFromDepo${s}, @PlanMassOreFromDepo${s}, @percent_oreFromDepo${s},
          @Cu_t_FromDepo${s}, @PlanVolIBRFromDepo${s}, @PlanMassIBRFromDepo${s}, @percent_IBRFromDepo${s},
          @Cu_t_IBRFromDepo${s}, @PlanVolOreDepo${s}, @PlanMassOreDepo${s}, @percent_oreDepo${s},
          @Cu_t_Depo${s}, @PlanVolIBRToDepo${s}, @PlanMassIBRToDepo${s}, @percent_IBRToDepo${s},
          @Cu_t_IBRToDepo${s}, @PlanVolWaste${s}, @PlanMassWaste${s}, @PlanVolTot${s}, @PlanMassTot${s},
          @Planvol${s}, @PlanMass${s}, @PlanTkmOre${s}, @AvgkmOre${s}, @PlanTkmWaste${s}, @AvgkmWaste${s},
          @PlanTkm${s}, @Avgkm${s}, @userAdded${s}
        )
      `);
    }
  });
}
