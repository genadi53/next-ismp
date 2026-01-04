import { sqlQuery } from "@/server/database/db";
import type { Road } from "./types.roads";

/**
 * Get all roads/travel paths.
 */
export async function getRoads(): Promise<Road[]> {
  return sqlQuery<Road>(`
    DECLARE @Curshift INT,
            @insertedRows INT,
            @CURshiftEndTime DATETIME,
            @NOW DATETIME = GETDATE()

    SELECT @Curshift = shiftid,
           @CURshiftEndTime = DATEADD(SECOND, ShiftDuration, ShiftStartDateTime)
    FROM [ELLOperational].common.ShiftInfo
    ORDER BY shiftid DESC OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY

    SELECT pittrav.[FieldId] AS travelName,
           [FieldLocstart],
           pitlocStart.FieldId AS StartPoint,
           pitlocStart.[FieldXloc] AS StartPointX,
           pitlocStart.[FieldYloc] AS StartPointY,
           pitlocStart.[FieldZloc] AS StartPointZ,
           [FieldLocend],
           pitlocEnd.FieldId AS [EndPoint],
           pitlocEnd.[FieldXloc] AS [EndPointX],
           pitlocEnd.[FieldYloc] AS [EndPointY],
           pitlocEnd.[FieldZloc] AS [EndPointZ],
           [FieldDist] AS pathDist,
           [FieldTimeempty],
           [FieldTimeloaded],
           [FieldClosed],
           ROUND(ATN2(
             (pitlocEnd.[FieldZloc] - pitlocStart.[FieldZloc]),
             NULLIF(SQRT(POWER(pitlocEnd.[FieldXloc] - pitlocStart.[FieldXloc], 2) + POWER(pitlocEnd.[FieldYloc] - pitlocStart.[FieldYloc], 2)), 0)
           ) * 100, 1) AS Elevation
    FROM [ELLOperational].[dbo].[PITTravel] AS pittrav
    LEFT JOIN [ELLOperational].[dbo].[PITPitloc] AS pitlocStart ON pittrav.FieldLocstart = pitlocStart.Id
    LEFT JOIN [ELLOperational].[dbo].[PITPitloc] AS pitlocEnd ON pittrav.FieldLocend = pitlocEnd.Id
  `);
}

