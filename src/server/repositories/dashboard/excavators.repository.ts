import { sqlQuery } from "@/server/database/db";
import type {
  ExcavRegionCount,
  TotalSumExcavs,
  HourCountExcav,
  HourProdExcav,
} from "./types.excavators";

/**
 * Get excavator count by region for the current shift.
 */
export async function countExcavRegion(): Promise<ExcavRegionCount[]> {
  return sqlQuery<ExcavRegionCount>(`
    ;WITH StatShovels AS (
      SELECT Excav.Id,
             Excav.FieldId,
             Excav.FieldLoc AS CurrentLocationId,
             Pitloc.FieldId AS CurrentLocation,
             Pitloc2.FieldId AS RegionName,
             Excav.FieldActlast AS ActlastId,
             Actlast.Description AS Actlast,
             Excav.FieldActnext AS ActnextId,
             Actnext.Description AS Actnext,
             Excav.FieldStatus AS StatusId,
             Status.Description AS Status
      FROM [DBADMINS].[ELLOperational].dbo.PITExcav AS Excav WITH (NOLOCK)
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS Actlast WITH (NOLOCK) ON Actlast.Id = Excav.FieldActlast
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS Actnext WITH (NOLOCK) ON Actnext.Id = Excav.FieldActnext
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS Status WITH (NOLOCK) ON Status.Id = Excav.FieldStatus
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pitloc WITH (NOLOCK) ON Pitloc.Id = Excav.FieldLoc
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pitloc2 WITH (NOLOCK) ON Pitloc.FieldRegion = Pitloc2.Id
      WHERE Excav.FieldStatus IN (217, 219)
    )
    SELECT *,
           SUM(trucksStatRegion) OVER (PARTITION BY part, RegionName) AS totalShovels
    FROM (
      SELECT 'Status' AS part,
             RegionName,
             [Status],
             COUNT(Fieldid) AS trucksStatRegion
      FROM StatShovels
      GROUP BY RegionName, [Status]
      
      UNION ALL
      
      SELECT 'Cycle' AS loadStatus,
             RegionName,
             'IDLE',
             COUNT(Actlast) AS waitForTruck
      FROM StatShovels
      WHERE Actlast = N'ПЪЛЕН'
      GROUP BY RegionName, Actlast
      
      UNION ALL
      
      SELECT 'Cycle' AS loadStatus,
             RegionName,
             'LOADING',
             COUNT(Actlast) AS waitForTruck
      FROM StatShovels
      WHERE Actlast = N'ПЪРВА КОФА'
      GROUP BY RegionName, Actlast
    ) AS partsTab
    ORDER BY part DESC, RegionName DESC
  `);
}

/**
 * Get total sum of excavators by status.
 */
export async function totalSumExcavs(): Promise<TotalSumExcavs[]> {
  return sqlQuery<TotalSumExcavs>(`
    ;WITH StatShovels AS (
      SELECT Excav.Id,
             Excav.FieldId,
             Excav.FieldLoc AS CurrentLocationId,
             Pitloc.FieldId AS CurrentLocation,
             Pitloc2.FieldId AS RegionName,
             Excav.FieldActlast AS ActlastId,
             Actlast.Description AS Actlast,
             Excav.FieldActnext AS ActnextId,
             Actnext.Description AS Actnext,
             Excav.FieldStatus AS StatusId,
             Status.Description AS Status
      FROM [DBADMINS].[ELLOperational].dbo.PITExcav AS Excav WITH (NOLOCK)
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS Actlast WITH (NOLOCK) ON Actlast.Id = Excav.FieldActlast
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS Actnext WITH (NOLOCK) ON Actnext.Id = Excav.FieldActnext
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS Status WITH (NOLOCK) ON Status.Id = Excav.FieldStatus
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pitloc WITH (NOLOCK) ON Pitloc.Id = Excav.FieldLoc
      LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pitloc2 WITH (NOLOCK) ON Pitloc.FieldRegion = Pitloc2.Id
      WHERE Excav.FieldStatus IN (217, 219)
    )
    SELECT *,
           SUM(trucksStatRegion) OVER (PARTITION BY part, RegionName) AS totalShovels
    FROM (
      SELECT 'Status' AS part,
             'RK' AS RegionName,
             [Status],
             COUNT(Fieldid) AS trucksStatRegion
      FROM StatShovels
      GROUP BY [Status]
      
      UNION ALL
      
      SELECT 'Cycle' AS loadStatus,
             'RK' AS RegionName,
             'IDLE',
             COUNT(Actlast) AS waitForTruck
      FROM StatShovels
      WHERE Actlast = N'ПЪЛЕН'
      GROUP BY Actlast
      
      UNION ALL
      
      SELECT loadStatus,
             RegionName,
             [Status],
             SUM(waitForTruck) AS waitForTruck
      FROM (
        SELECT 'Cycle' AS loadStatus,
               'RK' AS RegionName,
               'LOADING' AS [Status],
               COUNT(Actlast) AS waitForTruck
        FROM StatShovels
        WHERE Actlast = N'ПЪРВА КОФА'
        GROUP BY RegionName, Actlast
      ) AS shvTot
      GROUP BY loadStatus, RegionName, [Status]
    ) AS partsTab
    ORDER BY part DESC
  `);
}

/**
 * Get hourly excavator count for the current shift.
 */
export async function hourCountExcav(): Promise<HourCountExcav[]> {
  return sqlQuery<HourCountExcav>(`
    DECLARE @CurShift INT;
    SELECT @CurShift = MAX(shiftid) FROM [DBADMINS].[ELLOperational].common.shiftinfo;
    
    ;WITH BaseData AS (
      SELECT [FieldId],
             [ShiftId],
             [StatusId],
             FORMAT(DATEADD(S, TimestampQ, '1970-01-01'), N'HH:mm') AS [hour],
             TimestampQ,
             [RegionName]
      FROM [ELLDBAdmins].[dbo].[ShiftExcavsStatus30] WITH (NOLOCK)
      WHERE ShiftId = @CurShift
        AND StatusId IN (217, 219)
    ),
    ExcavCount AS (
      SELECT ShiftId,
             [hour],
             TimestampQ,
             RegionName,
             COUNT(DISTINCT FieldId) AS CountExcav
      FROM BaseData
      GROUP BY ShiftId, [hour], TimestampQ, RegionName
    ),
    Stable AS (
      SELECT shiftid,
             [hour],
             RegionName AS Region,
             SUM(CountExcav) AS CountExcav
      FROM ExcavCount
      GROUP BY shiftid, [hour], RegionName
      
      UNION ALL
      
      SELECT shiftid,
             [hour],
             N'ВСИЧКИ' AS Region,
             SUM(CountExcav) AS CountExcav
      FROM ExcavCount
      GROUP BY shiftid, [hour]
    )
    SELECT [hour],
           CAST(SUM(ISNULL([РУДА], 0)) AS INT) AS [РУДА],
           CAST(SUM(ISNULL([ОТКРИВКА1400], 0)) AS INT) AS [ОТКРИВКА1400],
           CAST(SUM(ISNULL([ОТКРИВКА], 0)) AS INT) AS [ОТКРИВКА],
           CAST(SUM(ISNULL([ВСИЧКИ], 0)) AS INT) AS [ВСИЧКИ]
    FROM Stable
    PIVOT (
      SUM(CountExcav)
      FOR Region IN ([РУДА], [ОТКРИВКА1400], [ОТКРИВКА], [ВСИЧКИ])
    ) AS PivotTable
    GROUP BY [hour]
    ORDER BY [hour]
  `);
}

/**
 * Get hourly excavator production for the current shift.
 */
export async function hourProdExcav(): Promise<HourProdExcav[]> {
  return sqlQuery<HourProdExcav>(`
    SELECT [hour],
           SUM(ISNULL([РУДА], 0)) AS [РУДА],
           SUM(ISNULL([ОТКРИВКА1400], 0)) AS [ОТКРИВКА1400],
           SUM(ISNULL([ОТКРИВКА], 0)) AS [ОТКРИВКА],
           SUM(ISNULL([ВСИЧКИ], 0)) AS [ВСИЧКИ]
    FROM (
      SELECT loadhour,
             CAST(CAST(loadhour AS TIME) AS NVARCHAR) AS [hourold],
             FORMAT(loadhour, N'HH:mm') AS [hour], 
             RegionName,
             SUM(Tonnage) AS loadedTons,
             COUNT(DISTINCT([Excav])) AS hourlyExcav,
             ROUND(SUM(Tonnage)/COUNT(DISTINCT([Excav])), 2) AS hourlyTons
      FROM (
        SELECT stdd.[Id],
               stdd.[ShiftId],
               Region AS RegionName,
               [Truck],
               [Excav],
               [LoadLocation],
               Tonnage,
               [TruckSize],
               [FullTimestamp],
               DATEADD(hour, DATEDIFF(hour, 0, [FullTimestamp]), 0) AS loadhour,
               [MaterialType]
        FROM [DBADMINS].[ELLOperational].[std].[StdShiftLoads] AS stdd
        LEFT JOIN [DBADMINS].[ELLOperational].std.[StdShiftLocations] AS stPL 
          ON stdd.[LoadLocationid]=stPL.[Id] AND stdd.[ShiftId]=stPL.[ShiftId]
        WHERE stdd.shiftid = (SELECT MAX(shiftid) FROM [DBADMINS].[ELLOperational].common.shiftinfo)
      ) AS dumpedHourly
      GROUP BY loadhour, RegionName
      
      UNION ALL
      
      SELECT loadhour,
             CAST(CAST(loadhour AS TIME) AS NVARCHAR) AS [hourold],
             FORMAT(loadhour, N'HH:mm') AS [hour], 
             N'ВСИЧКИ' AS RegionName,
             SUM(Tonnage) AS loadedTons,
             COUNT(DISTINCT([Excav])) AS hourlyExcav,
             ROUND(SUM(Tonnage)/COUNT(DISTINCT([Excav])), 2) AS hourlyTons
      FROM (
        SELECT stdd.[Id],
               stdd.[ShiftId],
               Region AS RegionName,
               [Truck],
               [Excav],
               [LoadLocation],
               Tonnage,
               [TruckSize],
               [FullTimestamp],
               DATEADD(hour, DATEDIFF(hour, 0, [FullTimestamp]), 0) AS loadhour,
               [MaterialType]
        FROM [DBADMINS].[ELLOperational].[std].[StdShiftLoads] AS stdd
        LEFT JOIN [DBADMINS].[ELLOperational].std.[StdShiftLocations] AS stPL 
          ON stdd.[LoadLocationid]=stPL.[Id] AND stdd.[ShiftId]=stPL.[ShiftId]
        WHERE stdd.shiftid = (SELECT MAX(shiftid) FROM [DBADMINS].[ELLOperational].common.shiftinfo)
      ) AS dumpedHourly
      GROUP BY loadhour
    ) AS Stable
    PIVOT (
      SUM(hourlyTons)
      FOR RegionName IN ([РУДА], [ОТКРИВКА1400], [ОТКРИВКА], [ВСИЧКИ])
    ) AS PivotTable
    GROUP BY hour
    ORDER BY [hour]
  `);
}
