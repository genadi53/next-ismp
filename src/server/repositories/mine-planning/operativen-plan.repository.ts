import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  PlanOperativen,
  CreatePlanOperativenInput,
} from "./types.plan-operativen";

/**
 * Get operational plan for the current date.
 */
export async function getMonthPlanOperativen(): Promise<PlanOperativen[]> {
  const date = new Date().toISOString().split("T")[0];

  return sqlQuery<PlanOperativen>(
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
      SUM([PlanVolOreKet]) AS [PlanVolOreKet],
      SUM([PlanmassOreKet]) AS [PlanmassOreKet],
      SUM([PlanOreDepoVol]) AS [PlanOreDepoVol],
      SUM([PlanOreDepoMass]) AS [PlanOreDepoMass],
      SUM([PlanOreFromDepoVol]) AS [PlanOreFromDepoVol],
      SUM([PlanOreFromDepoMass]) AS [PlanOreFromDepoMass],
      SUM([PlanIBRDepoVol]) AS PlanIBRDepoVol,
      SUM([PlanIBRDepoMass]) AS PlanIBRDepoMass,
      SUM([PlanIBRFROMDepoVol]) AS [PlanIBRFROMDepoVol],
      SUM([PlanIBRFROMDepoMass]) AS [PlanIBRFROMDepoMass],
      SUM([PlanVolWaste]) AS [PlanVolWaste],
      SUM([PlanMassWaste]) AS [PlanMassWaste],
      SUM([PlanTkm]) AS [PlanTkm],
      PlanTkmTruckDay,
      [userAdded],
      AVG([percent_ore_KET]) AS percent_ore_KET,
      AVG([Cu_t_KET]) AS Cu_t_KET,
      AVG([percent_ore]) AS percent_ore,
      AVG([Cu_t]) AS Cu_t,
      AVG([percent_oreFromDepo]) AS percent_oreFromDepo,
      AVG([Cu_t_FromDepo]) AS Cu_t_FromDepo,
      AVG([Cu_t_IBRFromDepo]) AS Cu_t_IBRFromDepo,
      AVG([percent_IBRFromDepo]) AS percent_IBRFromDepo,
      SUM([PlanVolOreMasiv]) AS PlanVolOreMasiv,
      SUM([PlanMassOreMasiv]) AS PlanMassOreMasiv,
      SUM([PlanVolOreProsip]) AS PlanVolOreProsip,
      SUM([PlanMassOreProsip]) AS PlanMassOreProsip,
      SUM([PlanVolWasteProsip]) AS PlanVolWasteProsip,
      SUM([PlanMassWasteProsip]) AS PlanMassWasteProsip,
      AVG([percent_oreMasiv]) AS percent_oreMasiv,
      AVG([Cu_t_Masiv]) AS Cu_t_Masiv,
      AVG([percent_oreProsip]) AS percent_oreProsip,
      AVG([Cu_t_Prosip]) AS Cu_t_Prosip,
      AVG([percent_oreDepo]) AS percent_oreDepo,
      AVG([Cu_t_Depo]) AS Cu_t_Depo
    FROM [ELLDBAdmins].[dbo].[MesechePlan]
    WHERE [PlanMonthDay] = (
      SELECT MAX([PlanMonthDay])
      FROM [ELLDBAdmins].[dbo].[MesechePlan]
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
      [userAdded],
      PlanTkmTruckDay
  `,
    { date },
  );
}

/**
 * Create operational plan entries.
 * Deletes existing entries for the month before inserting.
 */
export async function createMonthPlanOperativen(
  plans: CreatePlanOperativenInput[],
): Promise<void> {
  if (plans.length === 0) {
    throw new Error("Plans array cannot be empty");
  }

  await sqlTransaction(async (request) => {
    // Delete existing plans for this month
    request.input("planMonthDay", plans[0]!.PlanMonthDay);

    await request.query(`
      DELETE FROM [ELLDBAdmins].[dbo].[MesechePlan] 
      WHERE [PlanMonthDay] LIKE LEFT(@planMonthDay, 7) + '%'
    `);

    // Insert each plan
    for (let i = 0; i < plans.length; i++) {
      const row = plans[i]!;
      const s = `_${i}`;

      request.input(`PlanMonthDay${s}`, row.PlanMonthDay);
      request.input(`Object${s}`, row.Object);
      request.input(`PlanVolOre${s}`, row.PlanVolOre);
      request.input(`PlanMassOre${s}`, row.PlanMassOre);
      request.input(`PlanVolOreKet${s}`, row.PlanVolOreKet);
      request.input(`PlanmassOreKet${s}`, row.PlanmassOreKet);
      request.input(`PlanOreFromDepoVol${s}`, row.PlanOreFromDepoVol);
      request.input(`PlanOreFromDepoMass${s}`, row.PlanOreFromDepoMass);
      request.input(`PlanIBRDepoVol${s}`, row.PlanIBRDepoVol);
      request.input(`PlanIBRDepoMass${s}`, row.PlanIBRDepoMass);
      request.input(`PlanIBRFROMDepoVol${s}`, row.PlanIBRFROMDepoVol);
      request.input(`PlanIBRFROMDepoMass${s}`, row.PlanIBRFROMDepoMass);
      request.input(`PlanVolWaste${s}`, row.PlanVolWaste);
      request.input(`PlanMassWaste${s}`, row.PlanMassWaste);
      request.input(`PlanTkm${s}`, row.PlanTkm);
      request.input(`PlanTkmTruckDay${s}`, row.PlanTkmTruckDay);
      request.input(`percent_ore_KET${s}`, row.percent_ore_KET);
      request.input(`Cu_t_KET${s}`, row.Cu_t_KET);
      request.input(`percent_ore${s}`, row.percent_ore);
      request.input(`Cu_t${s}`, row.Cu_t);
      request.input(`percent_oreFromDepo${s}`, row.percent_oreFromDepo);
      request.input(`Cu_t_FromDepo${s}`, row.Cu_t_FromDepo);
      request.input(`Cu_t_IBRFromDepo${s}`, row.Cu_t_IBRFromDepo);
      request.input(`percent_IBRFromDepo${s}`, row.percent_IBRFromDepo);
      request.input(`PlanVolOreMasiv${s}`, row.PlanVolOreMasiv);
      request.input(`PlanMassOreMasiv${s}`, row.PlanMassOreMasiv);
      request.input(`PlanVolOreProsip${s}`, row.PlanVolOreProsip);
      request.input(`PlanMassOreProsip${s}`, row.PlanMassOreProsip);
      request.input(`PlanOreDepoVol${s}`, row.PlanOreDepoVol);
      request.input(`PlanOreDepoMass${s}`, row.PlanOreDepoMass);
      request.input(`PlanVolWasteProsip${s}`, row.PlanVolWasteProsip);
      request.input(`PlanMassWasteProsip${s}`, row.PlanMassWasteProsip);
      request.input(`percent_oreMasiv${s}`, row.percent_oreMasiv);
      request.input(`Cu_t_Masiv${s}`, row.Cu_t_Masiv);
      request.input(`percent_oreProsip${s}`, row.percent_oreProsip);
      request.input(`Cu_t_Prosip${s}`, row.Cu_t_Prosip);
      request.input(`percent_oreDepo${s}`, row.percent_oreDepo);
      request.input(`Cu_t_Depo${s}`, row.Cu_t_Depo);
      request.input(`PlanVolIBRToDepo${s}`, row.PlanVolIBRToDepo);
      request.input(`PlanMassIBRToDepo${s}`, row.PlanMassIBRToDepo);
      request.input(`percent_IBRToDepo${s}`, row.percent_IBRToDepo);
      request.input(`Cu_t_IBRToDepo${s}`, row.Cu_t_IBRToDepo);
      request.input(`userAdded${s}`, row.userAdded);

      await request.query(`
        INSERT INTO [ELLDBAdmins].[dbo].[MesechePlan] (
          [PlanMonthDay], [Object], [PlanVolOre], [PlanMassOre], [PlanVolOreKet],
          [PlanmassOreKet], [PlanOreFromDepoVol], [PlanOreFromDepoMass], [PlanIBRDepoVol],
          [PlanIBRDepoMass], [PlanIBRFROMDepoVol], [PlanIBRFROMDepoMass], [PlanVolWaste],
          [PlanMassWaste], [PlanTkm], [PlanTkmTruckDay], [percent_ore_KET], [Cu_t_KET],
          [percent_ore], [Cu_t], [percent_oreFromDepo], [Cu_t_FromDepo], [Cu_t_IBRFromDepo],
          [percent_IBRFromDepo], [PlanVolOreMasiv], [PlanMassOreMasiv], [PlanVolOreProsip],
          [PlanMassOreProsip], [PlanOreDepoVol], [PlanOreDepoMass], [PlanVolWasteProsip],
          [PlanMassWasteProsip], [percent_oreMasiv], [Cu_t_Masiv], [percent_oreProsip],
          [Cu_t_Prosip], [percent_oreDepo], [Cu_t_Depo], [PlanVolIBRToDepo], [PlanMassIBRToDepo],
          [percent_IBRToDepo], [Cu_t_IBRToDepo], [userAdded]
        )
        VALUES (
          @PlanMonthDay${s}, @Object${s}, @PlanVolOre${s}, @PlanMassOre${s}, @PlanVolOreKet${s},
          @PlanmassOreKet${s}, @PlanOreFromDepoVol${s}, @PlanOreFromDepoMass${s}, @PlanIBRDepoVol${s},
          @PlanIBRDepoMass${s}, @PlanIBRFROMDepoVol${s}, @PlanIBRFROMDepoMass${s}, @PlanVolWaste${s},
          @PlanMassWaste${s}, @PlanTkm${s}, @PlanTkmTruckDay${s}, @percent_ore_KET${s}, @Cu_t_KET${s},
          @percent_ore${s}, @Cu_t${s}, @percent_oreFromDepo${s}, @Cu_t_FromDepo${s}, @Cu_t_IBRFromDepo${s},
          @percent_IBRFromDepo${s}, @PlanVolOreMasiv${s}, @PlanMassOreMasiv${s}, @PlanVolOreProsip${s},
          @PlanMassOreProsip${s}, @PlanOreDepoVol${s}, @PlanOreDepoMass${s}, @PlanVolWasteProsip${s},
          @PlanMassWasteProsip${s}, @percent_oreMasiv${s}, @Cu_t_Masiv${s}, @percent_oreProsip${s},
          @Cu_t_Prosip${s}, @percent_oreDepo${s}, @Cu_t_Depo${s}, @PlanVolIBRToDepo${s}, @PlanMassIBRToDepo${s},
          @percent_IBRToDepo${s}, @Cu_t_IBRToDepo${s}, @userAdded${s}
        )
      `);
    }
  });
}

