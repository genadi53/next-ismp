import { sqlQuery, sqlQueryOne, sqlTransaction } from "@/server/database/db";
import type {
  HermesEquipment,
  HermesEquipmentNames,
  CreateEquipmentInput,
} from "@/types/hermes";

/**
 * Get all equipments from the database.
 */
export async function getAllEquipments(): Promise<HermesEquipment[]> {
  return sqlQuery<HermesEquipment>(`
    SELECT [ID] AS Id
          ,[DT_smetka]
          ,[Obekt]
          ,[DT_Priz1_ceh]
          ,[DT_Priz2_kod_zveno]
          ,[DT_Priz3_kod_eqmt]
          ,[EqmtName]
          ,[EqmtGroupName]
          ,[PriceMinnaMasa]
          ,[PriceShists]
          ,[PriceGrano]
          ,[Flag_new]
          ,[Flag_brak]
          ,[DspEqmt]
          ,[Active]
          ,[lrd]
    FROM [Hermes].[dbo].[EquipmentEnum]
  `);
}

/**
 * Get a single equipment by ID.
 */
export async function getEquipmentById(
  id: number,
): Promise<HermesEquipment | null> {
  return sqlQueryOne<HermesEquipment>(
    `
    SELECT [ID] AS Id
          ,[DT_smetka]
          ,[Obekt]
          ,[DT_Priz1_ceh]
          ,[DT_Priz2_kod_zveno]
          ,[DT_Priz3_kod_eqmt]
          ,[EqmtName]
          ,[EqmtGroupName]
          ,[PriceMinnaMasa]
          ,[PriceShists]
          ,[PriceGrano]
          ,[Flag_new]
          ,[Flag_brak]
          ,[DspEqmt]
          ,[Active]
          ,[lrd]
    FROM [Hermes].[dbo].[EquipmentEnum]
    WHERE [ID] = @id
  `,
    { id },
  );
}

/**
 * Get equipment names formatted for dropdown/select lists.
 */
export async function getEquipmentNames(): Promise<HermesEquipmentNames[]> {
  return sqlQuery<HermesEquipmentNames>(`
    SELECT [ID] AS Id,
           CASE 
             WHEN TRIM(ISNULL([DspEqmt], '')) <> '' THEN [DspEqmt] + ' - ' + [EqmtName] 
             ELSE [EqmtName] 
           END AS EquipmentName
    FROM [Hermes].[dbo].[EquipmentEnum]
    WHERE [EqmtName] <> N'оборудване тест'
  `);
}

/**
 * Create a new equipment.
 */
export async function createEquipment(
  input: CreateEquipmentInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("DT_smetka", input.DT_smetka);
    request.input("Obekt", input.Obekt);
    request.input("DT_Priz1_ceh", input.DT_Priz1_ceh);
    request.input("DT_Priz2_kod_zveno", input.DT_Priz2_kod_zveno);
    request.input("DT_Priz3_kod_eqmt", input.DT_Priz3_kod_eqmt);
    request.input("EqmtName", input.EqmtName);
    request.input("EqmtGroupName", input.EqmtGroupName);
    request.input("PriceMinnaMasa", input.PriceMinnaMasa);
    request.input("PriceShists", input.PriceShists);
    request.input("PriceGrano", input.PriceGrano);
    request.input("DspEqmt", input.DspEqmt);
    request.input("Active", input.Active);

    await request.query(`
      INSERT INTO [Hermes].[dbo].[EquipmentEnum](
          [DT_smetka],
          [Obekt],
          [DT_Priz1_ceh], 
          [DT_Priz2_kod_zveno], 
          [DT_Priz3_kod_eqmt],
          [EqmtName], 
          [EqmtGroupName], 
          [PriceMinnaMasa], 
          [PriceShists], 
          [PriceGrano],
          [DspEqmt], 
          [Active], 
          [lrd]
        )
      VALUES
        (@DT_smetka, @Obekt, @DT_Priz1_ceh, @DT_Priz2_kod_zveno, @DT_Priz3_kod_eqmt,
          @EqmtName, @EqmtGroupName, @PriceMinnaMasa, @PriceShists, @PriceGrano,
          @DspEqmt, @Active, GETDATE())
    `);
  });
}

/**
 * Update an existing equipment.
 */
export async function updateEquipment(
  id: number,
  input: CreateEquipmentInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("DT_smetka", input.DT_smetka);
    request.input("Obekt", input.Obekt);
    request.input("DT_Priz1_ceh", input.DT_Priz1_ceh);
    request.input("DT_Priz2_kod_zveno", input.DT_Priz2_kod_zveno);
    request.input("DT_Priz3_kod_eqmt", input.DT_Priz3_kod_eqmt);
    request.input("EqmtName", input.EqmtName);
    request.input("EqmtGroupName", input.EqmtGroupName);
    request.input("PriceMinnaMasa", input.PriceMinnaMasa);
    request.input("PriceShists", input.PriceShists);
    request.input("PriceGrano", input.PriceGrano);
    request.input("DspEqmt", input.DspEqmt);
    request.input("Active", input.Active);

    await request.query(`
      UPDATE [Hermes].[dbo].[EquipmentEnum]
      SET [DT_smetka] = @DT_smetka,
          [Obekt] = @Obekt,
          [DT_Priz1_ceh] = @DT_Priz1_ceh,
          [DT_Priz2_kod_zveno] = @DT_Priz2_kod_zveno,
          [DT_Priz3_kod_eqmt] = @DT_Priz3_kod_eqmt,
          [EqmtName] = @EqmtName,
          [EqmtGroupName] = @EqmtGroupName,
          [PriceMinnaMasa] = @PriceMinnaMasa,
          [PriceShists] = @PriceShists,
          [PriceGrano] = @PriceGrano,
          [DspEqmt] = @DspEqmt,
          [Active] = @Active,
          [lrd] = GETDATE()
      WHERE [ID] = @id
    `);
  });
}

/**
 * Delete an equipment by ID.
 */
export async function deleteEquipment(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      DELETE FROM [Hermes].[dbo].[EquipmentEnum]
      WHERE [ID] = @id
    `);
  });
}
