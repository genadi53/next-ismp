import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  BlastingPlan,
  CreateBlastingPlanInput,
  UpdateBlastingPlanInput,
} from "@/types/pvr";

/**
 * Get blasting plans from the last 2 months.
 */
export async function getBlastingPlans(): Promise<BlastingPlan[]> {
  return sqlQuery<BlastingPlan>(`
    SELECT [ID],
           CONVERT(NVARCHAR, [OperDate], 104) AS OperDate,
           [BlastingField],
           [Horizont1],
           [Horizont2],
           [Drill],
           [Drill2],
           [Holes],
           [Konturi],
           [MineVolume],
           [TypeBlast],
           [Disabled],
           [Note],
           CONVERT(NVARCHAR, [lrd], 120) AS lrd,
           userAdded
    FROM [ELLDBAdmins].[dbo].[OperativkaBlasting]
    WHERE CAST(Operdate AS DATE) >= CAST(DATEADD(DAY, (-DAY(GETDATE()) + 1), DATEADD(MONTH, -2, GETDATE())) AS DATE)
    ORDER BY ID DESC
  `);
}

/**
 * Create a new blasting plan.
 */
export async function createBlastingPlan(
  input: CreateBlastingPlanInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("OperDate", input.OperDate);
    request.input("BlastingField", input.BlastingField);
    request.input("Horizont1", input.Horizont1);
    request.input("Horizont2", input.Horizont2);
    request.input("Drill", input.Drill);
    request.input("Drill2", input.Drill2);
    request.input("TypeBlast", input.TypeBlast);
    request.input("Holes", input.Holes);
    request.input("Konturi", input.Konturi);
    request.input("MineVolume", input.MineVolume);
    request.input("Disabled", input.Disabled);
    request.input("Note", input.Note);
    request.input("userAdded", input.userAdded ?? "system");

    await request.query(`
      INSERT INTO [ELLDBAdmins].[dbo].[OperativkaBlasting] (
        [OperDate], [BlastingField], [Horizont1], [Horizont2], [Drill],
        [Drill2], [TypeBlast], [Holes], [Konturi], [MineVolume],
        [Disabled], [Note], [userAdded]
      )
      VALUES (
        @OperDate, @BlastingField, @Horizont1, @Horizont2, @Drill,
        @Drill2, @TypeBlast, @Holes, @Konturi, @MineVolume,
        @Disabled, @Note, @userAdded
      )
    `);
  });
}

/**
 * Update an existing blasting plan.
 */
export async function updateBlastingPlan(
  id: number,
  input: UpdateBlastingPlanInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("OperDate", input.OperDate);
    request.input("BlastingField", input.BlastingField);
    request.input("Horizont1", input.Horizont1);
    request.input("Horizont2", input.Horizont2);
    request.input("Drill", input.Drill);
    request.input("Drill2", input.Drill2);
    request.input("Holes", input.Holes);
    request.input("Konturi", input.Konturi);
    request.input("MineVolume", input.MineVolume);
    request.input("TypeBlast", input.TypeBlast);
    request.input("Disabled", input.Disabled);
    request.input("Note", input.Note);

    await request.query(`
      UPDATE [ELLDBAdmins].[dbo].[OperativkaBlasting]
      SET [OperDate] = @OperDate,
          [BlastingField] = @BlastingField,
          [Horizont1] = @Horizont1,
          [Horizont2] = @Horizont2,
          [Drill] = @Drill,
          [Drill2] = @Drill2,
          [Holes] = @Holes,
          [Konturi] = @Konturi,
          [MineVolume] = @MineVolume,
          [TypeBlast] = @TypeBlast,
          [Disabled] = @Disabled,
          [Note] = @Note
      WHERE ID = @id
    `);
  });
}

/**
 * Delete a blasting plan.
 */
export async function deleteBlastingPlan(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      DELETE FROM [ELLDBAdmins].[dbo].[OperativkaBlasting] WHERE ID = @id
    `);
  });
}

