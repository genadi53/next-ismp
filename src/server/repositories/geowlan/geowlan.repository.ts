import { sqlQuery, sqlQueryOne, sqlTransaction } from "@/server/database/db";
import type {
  GeowlanAP,
  CreateGeowlanAPInput,
  UpdateGeowlanAPInput,
} from "@/types/geowlan";

/**
 * Get all geowlan access points with mast information.
 */
export async function getGeowlanAPs(): Promise<GeowlanAP[]> {
  return sqlQuery<GeowlanAP>(`
    SELECT mast.[id],
           mast.[name],
           mast.[x],
           mast.[y],
           mast.[enabled],
           ap.id AS apId,
           ap.ip,
           ap.hardware,
           ap.LAN,
           ap.mac,
           ap.mast_id,
           ap.rgb
    FROM [GEOWLAN].[dbo].[geowlan_masts] mast
    LEFT JOIN [GEOWLAN].[dbo].[geowlan_AP] ap ON mast.id = ap.mast_id
    ORDER BY [id]
  `);
}

/**
 * Create a new geowlan access point with associated mast.
 */
export async function createGeowlanAP(
  input: CreateGeowlanAPInput,
): Promise<{ mastId: number }> {
  let mastId: number | null = null;

  await sqlTransaction(async (request) => {
    // First, insert into geowlan_masts table
    request.input("name", input.name);
    request.input("rgb", 1); // rgb enabled
    request.input("x", input.x);
    request.input("y", input.y);
    request.input("type", 1); // type
    request.input("enabled", input.enabled);

    await request.query(`
      INSERT INTO [GEOWLAN].[dbo].[geowlan_masts] (
        [name], [rgb], [x], [y], [type], [enabled]
      )
      VALUES (@name, @rgb, @x, @y, @type, @enabled)
    `);

    // Get the ID of the inserted mast
    const mastResult = await request.query<{ mast_id: number }>(`
      SELECT MAX(id) AS mast_id FROM [GEOWLAN].[dbo].[geowlan_masts]
    `);
    mastId = mastResult.recordset[0]?.mast_id ?? null;

    if (mastId === null) {
      throw new Error("Failed to get mast ID");
    }

    // Now insert into geowlan_AP table with the mast_id
    request.input("mac", input.mac);
    request.input("mast_id", mastId);
    request.input("ip", input.ip);
    request.input("hardware", input.hardware);
    request.input("LAN", input.LAN);
    request.input("apRgb", input.rgb ?? "1,1,1");

    await request.query(`
      INSERT INTO [GEOWLAN].[dbo].[geowlan_AP] (
        [name], [mac], [rgb], [mast_id], [ip], [hardware], [LAN]
      )
      VALUES (@name, @mac, @apRgb, @mast_id, @ip, @hardware, @LAN)
    `);
  });

  if (mastId === null) {
    throw new Error("Failed to create geowlan AP");
  }

  return { mastId };
}

/**
 * Update an existing geowlan access point and mast.
 */
export async function updateGeowlanAP(
  id: number,
  input: UpdateGeowlanAPInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("name", input.name);
    request.input("x", input.x);
    request.input("y", input.y);
    request.input("enabled", input.enabled);

    // Update mast
    await request.query(`
      UPDATE [GEOWLAN].[dbo].[geowlan_masts]
      SET [name] = @name,
          [x] = @x,
          [y] = @y,
          [enabled] = @enabled
      WHERE [id] = @id
    `);

    // Update AP if apId is provided
    if (input.apId !== null) {
      request.input("apId", input.apId);
      request.input("mac", input.mac);
      request.input("rgb", input.rgb);
      request.input("ip", input.ip);
      request.input("hardware", input.hardware);
      request.input("LAN", input.LAN);

      await request.query(`
        UPDATE [GEOWLAN].[dbo].[geowlan_AP]
        SET [name] = @name,
            [mac] = @mac,
            [rgb] = @rgb,
            [ip] = @ip,
            [hardware] = @hardware,
            [LAN] = @LAN
        WHERE [id] = @apId
      `);
    }
  });
}

/**
 * Delete a geowlan access point (mast).
 */
export async function deleteGeowlanAP(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      DELETE FROM [GEOWLAN].[dbo].[geowlan_masts]
      WHERE [id] = @id
    `);
  });
}

