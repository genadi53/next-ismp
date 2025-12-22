import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  MgtlOre,
  CreateMgtlOreInput,
  UpdateMgtlOreInput,
} from "@/types/dispatcher";

/**
 * Get MGTL ore export data for the last 2 months.
 */
export async function getMgtlOre(): Promise<MgtlOre[]> {
  return sqlQuery<MgtlOre>(`
    SELECT [ID],
           CONVERT(NVARCHAR, [OperDate], 120) AS OperDate,
           [Izvoz1],
           [Mgtl1],
           [Izvoz2],
           [Mgtl2],
           [Izvoz3],
           [Mgtl3],
           [Izvoz4],
           [Mgtl4],
           ISNULL([Mgtl1], 0) + ISNULL([Mgtl3], 0) + ISNULL([Mgtl4], 0) AS [SumMGTL],
           CONVERT(NVARCHAR, [lrd], 120) AS lrd,
           lrby
    FROM [ELLDBAdmins].[dbo].[IZVOZ]
    WHERE CAST(Operdate AS DATE) >= CAST(DATEADD(DAY, (-DAY(GETDATE()) + 1), DATEADD(MONTH, -2, GETDATE())) AS DATE)
    ORDER BY ID DESC
  `);
}

/**
 * Create a new MGTL ore entry.
 */
export async function createMgtlOre(input: CreateMgtlOreInput): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("OperDate", input.OperDate);
    request.input("Izvoz1", input.Izvoz1);
    request.input("Mgtl1", input.Mgtl1);
    request.input("Izvoz3", input.Izvoz3);
    request.input("Mgtl3", input.Mgtl3);
    request.input("Izvoz4", input.Izvoz4);
    request.input("Mgtl4", input.Mgtl4);

    await request.query(`
      INSERT INTO [ELLDBAdmins].[dbo].[IZVOZ] (
        [OperDate], [Izvoz1], [Mgtl1], [Izvoz3], [Mgtl3], [Izvoz4], [Mgtl4], [lrby]
      )
      VALUES (CAST(@OperDate AS DATETIME), @Izvoz1, @Mgtl1, @Izvoz3, @Mgtl3, @Izvoz4, @Mgtl4, 'PULSE')
    `);
  });
}

/**
 * Update an existing MGTL ore entry.
 */
export async function updateMgtlOre(
  id: number,
  input: UpdateMgtlOreInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("Izvoz1", input.Izvoz1);
    request.input("Mgtl1", input.Mgtl1);
    request.input("Izvoz3", input.Izvoz3);
    request.input("Mgtl3", input.Mgtl3);
    request.input("Izvoz4", input.Izvoz4);
    request.input("Mgtl4", input.Mgtl4);

    await request.query(`
      UPDATE [ELLDBAdmins].[dbo].[IZVOZ] 
      SET [Izvoz1] = @Izvoz1,
          [Mgtl1] = @Mgtl1,
          [Izvoz3] = @Izvoz3,
          [Mgtl3] = @Mgtl3,
          [Izvoz4] = @Izvoz4,
          [Mgtl4] = @Mgtl4
      WHERE ID = @id
    `);
  });
}

