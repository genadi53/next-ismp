import { sqlQuery } from "@/server/database/db";
import type { PrestartLocation, PrestartLock } from "@/types/prestart";

/**
 * Get all prestart locations.
 */
export async function getPrestartLocations(): Promise<PrestartLocation[]> {
  return sqlQuery<PrestartLocation>(`
    ;WITH locations AS (
      SELECT Loc.Id,
             Loc.FieldId,
             Loc.FieldPit AS PitId,
             Pit.FieldId AS Pit,
             Loc.FieldRegion AS RegionId,
             Region.FieldId AS Region,
             Loc.FieldZloc AS Elevation,
             LocUnitT.[Description] AS Unit,
             Loc.FieldStatus,
             LocStatus.[Description] AS [Status]
      FROM [DBADMINS].[ELLOperational].dbo.PITPitloc AS Loc WITH (NOLOCK)
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pit WITH (NOLOCK) ON Loc.FieldPit = Pit.Id
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Region WITH (NOLOCK) ON Loc.FieldRegion = Region.Id
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS LocUnitT WITH (NOLOCK) ON LocUnitT.Id = Loc.FieldUnit
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.Enum AS LocStatus WITH (NOLOCK) ON LocStatus.Id = Loc.FieldStatus
      WHERE LocUnitT.[Description] IN (N'Взривно поле', N'Склад', N'Развал', N'Трошачка')
    )
    SELECT * FROM locations
    ORDER BY Region, Unit
  `);
}

/**
 * Get prestart locks.
 */
export async function getPrestartLocks(): Promise<PrestartLock[]> {
  return sqlQuery<PrestartLock>(`
    SELECT excav.FieldId,
           FieldDumplock,
           dumpLoc.FieldId AS Dump,
           FieldRegionlock,
           region.FieldId AS Region 
    FROM [ELLOperational].[dbo].[PITExcav] excav WITH (NOLOCK)
    LEFT JOIN [ELLOperational].dbo.PITPitloc AS region WITH (NOLOCK) ON region.Id = excav.FieldRegionlock
    LEFT JOIN [ELLOperational].dbo.PITPitloc AS dumpLoc WITH (NOLOCK) ON dumpLoc.Id = excav.FieldDumplock
    LEFT JOIN [ELLOperational].dbo.PITPitloc AS loadLoc WITH (NOLOCK) ON loadLoc.Id = excav.FieldExcavlock
    WHERE FieldDumplock > -1 
       OR FieldRegionlock > -1
       OR FieldExcavlock > -1 
  `);
}

