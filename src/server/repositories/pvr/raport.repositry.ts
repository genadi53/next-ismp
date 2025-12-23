import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  BlastReport,
  CreateBlastReportInput,
  UpdateBlastReportInput,
} from "@/types/pvr";

/**
 * Get all blast reports.
 */
export async function getBlastReports(): Promise<BlastReport[]> {
  return sqlQuery<BlastReport>(`
    SELECT [ID],
           [ShiftDate],
           [VP_num],
           [Horiz],
           [site_conditon],
           [quality_do_1m],
           [quality_nad_1m],
           [quality_zone_prosip],
           [water_presence_drilling],
           [water_presence_fueling],
           [E3400],
           [ANFO],
           [E1100],
           [non_retaining],
           [quality_explosive],
           [quality_zatapka],
           [smoke_presence],
           [scattering],
           [presence_negabarit],
           [state_blast_material],
           [state_blast_site_after],
           [non_blasted_num],
           [Initiate],
           [lrd],
           [CreatedFrom],
           [EditedFrom]
    FROM [ISMP].[dbo].[Raport]
  `);
}

/**
 * Create a new blast report.
 */
export async function createBlastReport(
  input: CreateBlastReportInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("ShiftDate", input.ShiftDate);
    request.input("VP_num", input.VP_num);
    request.input("Horiz", input.Horiz);
    request.input("site_conditon", input.site_conditon);
    request.input("quality_do_1m", input.quality_do_1m);
    request.input("quality_nad_1m", input.quality_nad_1m);
    request.input("quality_zone_prosip", input.quality_zone_prosip);
    request.input("water_presence_drilling", input.water_presence_drilling);
    request.input("water_presence_fueling", input.water_presence_fueling);
    request.input("E3400", input.E3400);
    request.input("ANFO", input.ANFO);
    request.input("E1100", input.E1100);
    request.input("non_retaining", input.non_retaining);
    request.input("quality_explosive", input.quality_explosive);
    request.input("quality_zatapka", input.quality_zatapka);
    request.input("smoke_presence", input.smoke_presence);
    request.input("scattering", input.scattering);
    request.input("presence_negabarit", input.presence_negabarit);
    request.input("state_blast_material", input.state_blast_material);
    request.input("state_blast_site_after", input.state_blast_site_after);
    request.input("non_blasted_num", input.non_blasted_num);
    request.input("Initiate", input.Initiate);
    request.input("CreatedFrom", input.CreatedFrom ?? "system");
    request.input("EditedFrom", input.EditedFrom ?? "system");

    await request.query(`
      INSERT INTO [ISMP].[dbo].[Raport] (
        [ShiftDate], [VP_num], [Horiz], [site_conditon], [quality_do_1m],
        [quality_nad_1m], [quality_zone_prosip], [water_presence_drilling],
        [water_presence_fueling], [E3400], [ANFO], [E1100], [non_retaining],
        [quality_explosive], [quality_zatapka], [smoke_presence], [scattering],
        [presence_negabarit], [state_blast_material], [state_blast_site_after],
        [non_blasted_num], [Initiate], [CreatedFrom], [EditedFrom]
      )
      VALUES (
        @ShiftDate, @VP_num, @Horiz, @site_conditon, @quality_do_1m,
        @quality_nad_1m, @quality_zone_prosip, @water_presence_drilling,
        @water_presence_fueling, @E3400, @ANFO, @E1100, @non_retaining,
        @quality_explosive, @quality_zatapka, @smoke_presence, @scattering,
        @presence_negabarit, @state_blast_material, @state_blast_site_after,
        @non_blasted_num, @Initiate, @CreatedFrom, @EditedFrom
      )
    `);
  });
}

/**
 * Update an existing blast report.
 */
export async function updateBlastReport(
  id: number,
  input: UpdateBlastReportInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("ShiftDate", input.ShiftDate);
    request.input("VP_num", input.VP_num);
    request.input("Horiz", input.Horiz);
    request.input("site_conditon", input.site_conditon);
    request.input("quality_do_1m", input.quality_do_1m);
    request.input("quality_nad_1m", input.quality_nad_1m);
    request.input("quality_zone_prosip", input.quality_zone_prosip);
    request.input("water_presence_drilling", input.water_presence_drilling);
    request.input("water_presence_fueling", input.water_presence_fueling);
    request.input("E3400", input.E3400);
    request.input("ANFO", input.ANFO);
    request.input("E1100", input.E1100);
    request.input("non_retaining", input.non_retaining);
    request.input("quality_explosive", input.quality_explosive);
    request.input("quality_zatapka", input.quality_zatapka);
    request.input("smoke_presence", input.smoke_presence);
    request.input("scattering", input.scattering);
    request.input("presence_negabarit", input.presence_negabarit);
    request.input("state_blast_material", input.state_blast_material);
    request.input("state_blast_site_after", input.state_blast_site_after);
    request.input("non_blasted_num", input.non_blasted_num);
    request.input("Initiate", input.Initiate);

    await request.query(`
      UPDATE [ISMP].[dbo].[Raport]
      SET [ShiftDate] = @ShiftDate,
          [VP_num] = @VP_num,
          [Horiz] = @Horiz,
          [site_conditon] = @site_conditon,
          [quality_do_1m] = @quality_do_1m,
          [quality_nad_1m] = @quality_nad_1m,
          [quality_zone_prosip] = @quality_zone_prosip,
          [water_presence_drilling] = @water_presence_drilling,
          [water_presence_fueling] = @water_presence_fueling,
          [E3400] = @E3400,
          [ANFO] = @ANFO,
          [E1100] = @E1100,
          [non_retaining] = @non_retaining,
          [quality_explosive] = @quality_explosive,
          [quality_zatapka] = @quality_zatapka,
          [smoke_presence] = @smoke_presence,
          [scattering] = @scattering,
          [presence_negabarit] = @presence_negabarit,
          [state_blast_material] = @state_blast_material,
          [state_blast_site_after] = @state_blast_site_after,
          [non_blasted_num] = @non_blasted_num,
          [Initiate] = @Initiate
      WHERE ID = @id
    `);
  });
}

