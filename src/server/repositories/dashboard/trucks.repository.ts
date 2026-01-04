import { sqlQuery } from "@/server/database/db";
import type {
  TruckRegionCount,
  TotalSumTrucks,
  HourCountTruck,
  HourProdTruck,
  InfoTruck,
} from "./types.trucks";

/**
 * Get truck count by region for the current shift.
 */
export async function countTruckRegion(): Promise<TruckRegionCount[]> {
  return sqlQuery<TruckRegionCount>(`
    DECLARE @curShift NVARCHAR(10)
    SELECT @curShift = MAX(Shiftid) FROM [DBADMINS].[ELLOperational].Common.ShiftInfo;

    ;WITH PROD_STAT AS (
      SELECT GETDATE() AS execTime,
             stTruck.[FieldId],
             [Id],
             stTruck.StatusId,
             stTruck.[Status],
             CONCAT(stTruck.[Status], '(', [FieldReason], '-', stRsn.[FieldName], ')') AS Eqmtstatus,
             [Load],
             [TruckRegionlock],
             RegionName
      FROM (
        SELECT Truck.Id,
               Truck.FieldId,
               Truck.FieldReason,
               [Load].Description AS [Load],
               Truck.FieldRegionlock AS TruckRegionlockId,
               Pitloc6.FieldId AS TruckRegionlock,
               Truck.FieldStatus AS StatusId,
               Status.Description AS Status,
               getRegion.RegionName
        FROM [DBADMINS].[ELLOperational].dbo.PITTruck AS Truck WITH (NOLOCK)
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS [Load] WITH (NOLOCK) ON [Load].Id = Truck.FieldLoad
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].Common.EnumSTATUS AS Status WITH (NOLOCK) ON Status.Id = Truck.FieldStatus
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pitloc6 WITH (NOLOCK) ON Pitloc6.Id = Truck.FieldRegionlock
        LEFT JOIN (
          SELECT ste.[Id] AS excavID,
                 ste.[FieldId],
                 [CurrentLocationId],
                 [CurrentLocation],
                 RegionName
          FROM [DBADMINS].[ELLOperational].[std].[StdExcav] AS stE
          LEFT JOIN [DBADMINS].[ELLOperational].std.StdPitloc AS stPL ON ste.CurrentLocationId = stPL.Id
        ) AS getRegion ON (Truck.FieldExcav = getRegion.excavID)
      ) AS stTruck
      INNER JOIN (
        SELECT [Status],
               st.id AS StatusId,
               st.description AS StatusName,
               [FieldId],
               [FieldName]
        FROM [DBADMINS].[ELLOperational].[Common].[Reasons] AS rsn
        INNER JOIN [DBADMINS].[ELLOperational].[Common].[EnumSTATUS] AS st ON rsn.status = st.idx
      ) AS stRsn ON stRsn.[FieldId] = stTruck.FieldReason
      WHERE stTruck.Fieldid LIKE '%C%'
        AND stTruck.Fieldid NOT LIKE '2C999%'
        AND stTruck.StatusId IN (219, 217)
    ),
    CUR_mv_TRucks AS (
      SELECT id,
             trMov.EquipmentId,
             timestamp,
             speed
      FROM [DBADMINS].ELLOperational.PositionTrackingHistorical.RawPositions AS trMov WITH (NOLOCK)
      INNER JOIN (
        SELECT MAX([ID]) AS mID, [EquipmentId]
        FROM [DBADMINS].ELLOperational.PositionTrackingHistorical.RawPositions WITH (NOLOCK)
        WHERE id LIKE (CONCAT((SELECT MAX(Shiftid) FROM [DBADMINS].[ELLOperational].Common.ShiftInfo), '%'))
          AND EquipmentId LIKE '%C%'
        GROUP BY [EquipmentId]
      ) AS mIdTruck ON trMov.ID = mIdTruck.mID
      WHERE trMov.speed > 10
    )
    SELECT 'Status' AS part,
           RegionName,
           [Status],
           COUNT(Fieldid) AS trucksStatRegion
    FROM PROD_STAT
    GROUP BY RegionName, [Status]
    UNION ALL
    SELECT 'Load' AS loadStatus,
           RegionName,
           load,
           COUNT(Fieldid) AS trucksStatRegion
    FROM PROD_STAT
    GROUP BY RegionName, load
    UNION ALL
    SELECT 'Moving' AS loadStatus,
           RegionName,
           load,
           COUNT(EquipmentId) AS trucksStatRegion
    FROM PROD_STAT
    INNER JOIN CUR_mv_TRucks ON CUR_mv_TRucks.EquipmentId = PROD_STAT.Fieldid
    GROUP BY RegionName, load
  `);
}

/**
 * Get total sum of trucks by status and region.
 */
export async function totalSumTrucks(): Promise<TotalSumTrucks[]> {
  return sqlQuery<TotalSumTrucks>(`
    ;WITH PROD_STAT AS (
      SELECT stTruck.[FieldId],
             stTruck.StatusId,
             stTruck.[Status],
             [CurrentLocation],
             [Actlast],
             [Load],
             [Actnext],
             RegionName
      FROM (
        SELECT Truck.Id,
               Truck.FieldId,
               Truck.FieldLoc AS CurrentLocationId,
               Pitloc.FieldId AS CurrentLocation,
               Pitloc2.FieldId AS RegionName,
               Truck.FieldReason,
               Truck.FieldActlast AS ActlastId,
               Actlast.Description AS Actlast,
               Truck.FieldActnext AS ActnextId,
               Actnext.Description AS Actnext,
               [Load].Description AS [Load],
               Truck.FieldStatus AS StatusId,
               Status.Description AS Status
        FROM [DBADMINS].[ELLOperational].dbo.PITTruck AS Truck WITH (NOLOCK)
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS Actlast WITH (NOLOCK) ON Actlast.Id = Truck.FieldActlast
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS Actnext WITH (NOLOCK) ON Actnext.Id = Truck.FieldActnext
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].Common.EnumSTATUS AS Status WITH (NOLOCK) ON Status.Id = Truck.FieldStatus
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.Enum AS [Load] WITH (NOLOCK) ON [Load].Id = Truck.FieldLoad
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pitloc WITH (NOLOCK) ON Pitloc.Id = Truck.FieldLoc
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pitloc2 WITH (NOLOCK) ON Pitloc.FieldRegion = Pitloc2.Id
      ) AS stTruck
      INNER JOIN (
        SELECT [Status],
               st.id AS StatusId,
               st.description AS StatusName,
               [FieldId],
               [FieldName]
        FROM [DBADMINS].[ELLOperational].[Common].[Reasons] AS rsn
        INNER JOIN [DBADMINS].[ELLOperational].[Common].[EnumSTATUS] AS st ON rsn.status = st.idx
      ) AS stRsn ON stRsn.[FieldId] = stTruck.FieldReason
      WHERE stTruck.Fieldid LIKE '%C%'
        AND stTruck.Fieldid NOT LIKE '2C999%'
        AND stTruck.StatusId IN (219, 217)
    ),
    CUR_mv_TRucks AS (
      SELECT DISTINCT trMov.EquipmentId
      FROM [DBADMINS].ELLOperational.PositionTrackingHistorical.RawPositions AS trMov WITH (NOLOCK)
      INNER JOIN (
        SELECT MAX([ID]) AS mID, [EquipmentId]
        FROM [DBADMINS].ELLOperational.PositionTrackingHistorical.RawPositions WITH (NOLOCK)
        WHERE id LIKE (CONCAT((SELECT MAX(Shiftid) FROM [DBADMINS].[ELLOperational].Common.ShiftInfo), '%'))
          AND EquipmentId LIKE '%C%'
        GROUP BY [EquipmentId]
      ) AS mIdTruck ON trMov.ID = mIdTruck.mID
      WHERE trMov.speed > 10
    ),
    CUSST_Fn_trucks_moving_status AS (
      SELECT 'Status' AS part,
             RegionName,
             [Status],
             COUNT(Fieldid) AS trucksStatRegion
      FROM PROD_STAT
      GROUP BY RegionName, [Status]
      UNION ALL
      SELECT 'Load' AS loadStatus,
             RegionName,
             load,
             COUNT(Fieldid) AS trucksStatRegion
      FROM PROD_STAT
      GROUP BY RegionName, load
      UNION ALL
      SELECT 'Moving' AS loadStatus,
             RegionName,
             load,
             COUNT(EquipmentId) AS trucksStatRegion
      FROM PROD_STAT
      INNER JOIN CUR_mv_TRucks ON CUR_mv_TRucks.EquipmentId = PROD_STAT.Fieldid
      GROUP BY RegionName, load
    )
    SELECT part,
           RegionName,
           [Status],
           SUM(trucksStatRegion) AS trucksStatRegion,
           SUM(DISTINCT totalTrucks) AS totalTrucks
    FROM (
      SELECT part,
             'RK' AS RegionName,
             [Status],
             trucksStatRegion,
             SUM(trucksStatRegion) OVER (PARTITION BY part) AS totalTrucks
      FROM CUSST_Fn_trucks_moving_status
    ) AS pp
    GROUP BY part, RegionName, [status]
  `);
}

/**
 * Get hourly truck count for the current shift.
 */
export async function hourCountTruck(): Promise<HourCountTruck[]> {
  return sqlQuery<HourCountTruck>(`
    DECLARE @CurShift INT;
    SELECT @CurShift = MAX(shiftid) FROM [DBADMINS].[ELLOperational].common.shiftinfo;
    
    ;WITH BaseData AS (
      SELECT [FieldId],
             [ShiftId],
             [StatusId],
             [Status],
             CAST(DATEADD(HOUR, DATEDIFF(HOUR, 0, [lrd]), 0) AS TIME) AS [Time],
             [lrd],
             [CurRegion]
      FROM [ELLDBAdmins].[dbo].[ShiftTrucksStatusEfficiency15] WITH (NOLOCK)
      WHERE ShiftId = @CurShift
        AND StatusId IN (217, 219)
    ),
    TruckCount AS (
      SELECT ShiftId,
             lrd,
             [Status],
             StatusId AS statusid,
             COUNT(FieldId) AS CountTruck,
             [Time],
             [Time] AS TimesGroup,
             CurRegion
      FROM BaseData
      GROUP BY ShiftId, lrd, [Time], [Status], StatusId, CurRegion
    ),
    FinishTruckCount AS (
      SELECT ShiftId,
             TimesGroup,
             [Status],
             statusid,
             SUM(CountTruck) AS CountTruckGroup,
             CurRegion
      FROM TruckCount
      GROUP BY ShiftId, TimesGroup, [Status], statusid, CurRegion
    ),
    TimeCountFULLEnd AS (
      SELECT shiftid,
             TimesGroup,
             COUNT(lrd) AS Countlrd,
             CurRegion
      FROM (
        SELECT DISTINCT ShiftId,
               lrd,
               CAST(DATEADD(HOUR, DATEDIFF(HOUR, 0, [lrd]), 0) AS TIME) AS TimesGroup,
               CurRegion
        FROM BaseData
      ) AS TimeCountFULL
      GROUP BY shiftid, TimesGroup, CurRegion
    ),
    t1 AS (
      SELECT ftc.ShiftId,
             ftc.TimesGroup,
             ftc.[Status],
             ftc.statusid,
             ftc.CountTruckGroup,
             tce.Countlrd,
             CASE WHEN ftc.TimesGroup = CAST('23:00:00' AS TIME) THEN 1 ELSE 2 END AS lrd,
             ftc.CurRegion
      FROM FinishTruckCount ftc
      LEFT JOIN TimeCountFULLEnd tce ON ftc.ShiftId = tce.ShiftId
        AND ftc.TimesGroup = tce.TimesGroup
        AND ftc.CurRegion = tce.CurRegion
    ),
    ALLSCRIPT AS (
      SELECT ShiftId,
             TimesGroup,
             [Status],
             statusid,
             CountTruckGroup,
             Countlrd,
             ROUND((CountTruckGroup * 1.00) / (Countlrd * 1.00), 0) AS CountTruck,
             lrd,
             CurRegion
      FROM t1
    ),
    Stable AS (
      SELECT shiftid,
             TimesGroup AS [hour],
             CurRegion AS Region,
             SUM(CountTruck) AS CountTruck,
             lrd
      FROM ALLSCRIPT
      GROUP BY shiftid, TimesGroup, CurRegion, lrd
      
      UNION ALL
      
      SELECT shiftid,
             TimesGroup AS [hour],
             N'ВСИЧКИ' AS Region,
             SUM(CountTruck) AS CountTruck,
             lrd
      FROM ALLSCRIPT
      GROUP BY shiftid, TimesGroup, lrd
    )
    SELECT LEFT(CONVERT(NVARCHAR, [hour], 120), 5) AS [hour],
           CAST(SUM(ISNULL([РУДА], 0)) AS INT) AS [РУДА],
           CAST(SUM(ISNULL([ОТКРИВКА1400], 0)) AS INT) AS [ОТКРИВКА1400],
           CAST(SUM(ISNULL([ОТКРИВКА], 0)) AS INT) AS [ОТКРИВКА],
           CAST(SUM(ISNULL([ВСИЧКИ], 0)) AS INT) AS [ВСИЧКИ],
           lrd
    FROM Stable
    PIVOT (
      SUM(CountTruck)
      FOR Region IN ([РУДА], [ОТКРИВКА1400], [ОТКРИВКА], [ВСИЧКИ])
    ) AS PivotTable
    GROUP BY [hour], lrd
    ORDER BY [hour], lrd
  `);
}

/**
 * Get hourly truck production for the current shift.
 */
export async function hourProdTruck(): Promise<HourProdTruck[]> {
  return sqlQuery<HourProdTruck>(`
    DECLARE @curShift INT
    SELECT @curShift = MAX(shiftid) FROM [DBADMINS].[ELLOperational].common.shiftinfo

    SELECT [hour],
           SUM(ISNULL([РУДА], 0)) AS [РУДА], 
           SUM(ISNULL([ОТКРИВКА1400], 0)) AS [ОТКРИВКА1400], 
           SUM(ISNULL([ОТКРИВКА], 0)) AS [ОТКРИВКА],
           SUM(ISNULL([ВСИЧКИ], 0)) AS [ВСИЧКИ]
    FROM (
      SELECT dumphour,
             CAST(CAST(dumphour AS TIME) AS NVARCHAR) AS [hourold],
             FORMAT(dumphour, N'HH:mm') AS [hour], 
             RegionName,
             SUM(Tonnage) AS dumpedTons,
             COUNT(DISTINCT(Truck)) AS hourlyTrucks,
             ROUND(SUM(Tonnage)/COUNT(DISTINCT(Truck)), 0) AS hourlyTons
      FROM (
        SELECT stdd.[Id],
               stdd.[ShiftId],
               Region AS RegionName,
               [Truck],
               [Excav],
               [GradeId],
               [Grade],
               [DumpLocation],
               [BlastLocation],
               [BlastLocationId],
               [Tons],
               Tonnage,
               [TruckSize],
               [DumpingTimestamp],
               DATEADD(hour, DATEDIFF(hour, 0, [DumpingTimestamp]), 0) AS dumphour,
               [DumpingTime],
               [MaterialType]
        FROM [DBADMINS].[ELLOperational].[std].[StdShiftDumps] AS stdd
        LEFT JOIN [DBADMINS].[ELLOperational].std.StdShiftLocations AS stPL ON stdd.[BlastLocationId]=stPL.[Id]
        WHERE stdd.shiftid = @curShift
      ) AS dumpedHourly
      GROUP BY dumphour, RegionName
      
      UNION ALL
      
      SELECT dumphour,
             CAST(CAST(dumphour AS TIME) AS NVARCHAR) AS [hourold],
             FORMAT(dumphour, N'HH:mm') AS [hour], 
             N'ВСИЧКИ' AS RegionName,
             SUM(Tonnage) AS dumpedTons,
             COUNT(DISTINCT(Truck)) AS hourlyTrucks,
             ROUND(SUM(Tonnage)/COUNT(DISTINCT(Truck)), 0) AS hourlyTons
      FROM (
        SELECT stdd.[Id],
               stdd.[ShiftId],
               Region AS RegionName,
               [Truck],
               [Excav],
               [GradeId],
               [Grade],
               [DumpLocation],
               [BlastLocation],
               [BlastLocationId],
               [Tons],
               Tonnage,
               [TruckSize],
               [DumpingTimestamp],
               DATEADD(hour, DATEDIFF(hour, 0, [DumpingTimestamp]), 0) AS dumphour,
               [DumpingTime],
               [MaterialType]
        FROM [DBADMINS].[ELLOperational].[std].[StdShiftDumps] AS stdd
        LEFT JOIN [DBADMINS].[ELLOperational].std.StdShiftLocations AS stPL ON stdd.[BlastLocationId]=stPL.[Id]
        WHERE stdd.shiftid = @curShift
      ) AS dumpedHourly
      GROUP BY dumphour
    ) AS Stable
    PIVOT (
      SUM(hourlyTons)
      FOR RegionName IN ([РУДА], [ОТКРИВКА1400], [ОТКРИВКА], [ВСИЧКИ])
    ) AS PivotTable
    GROUP BY hour
    ORDER BY [hour]
  `);
}

/**
 * Get information about trucks (location, assignment, delay reason).
 */
export async function getInfoTrucks(): Promise<InfoTruck[]> {
  return sqlQuery<InfoTruck>(`
    SELECT fieldid AS truck,
           CurrentLocation AS Loc,
           ISNULL(Assignment, '') AS Assignment,
           ISNULL(ReasonDesc, '') AS ReasonDelay
    FROM (
      SELECT aaa.FieldId,
             CurrentLocation,
             CASE WHEN DumpAssignment IS NULL THEN NextShovelAssignment
                  ELSE DumpAssignment END AS Assignment,
             ReasonDesc
      FROM (
        SELECT Truck.Id,
               Truck.FieldId,
               Truck.FieldExcavnext AS NextShovelAssignmentId,
               Excav.FieldId AS NextShovelAssignment,
               Truck.FieldLoc AS CurrentLocationId,
               Pitloc.FieldId AS CurrentLocation,
               Truck.FieldDumpasn AS DumpAssignmentId,
               Pitloc3.FieldId AS DumpAssignment,
               de.FieldName AS ReasonDesc
        FROM [DBADMINS].[ELLOperational].dbo.PITTruck AS Truck WITH (NOLOCK)
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITExcav AS Excav WITH (NOLOCK) ON Excav.Id = Truck.FieldExcavnext
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pitloc WITH (NOLOCK) ON Pitloc.Id = Truck.FieldLoc
        LEFT OUTER JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc AS Pitloc3 WITH (NOLOCK) ON Pitloc3.Id = Truck.FieldDumpasn
        LEFT JOIN [DBADMINS].ELLOperational.dbo.PITReasondelay AS de ON Truck.FieldReason = de.FieldId
        WHERE Truck.FieldStatus IN (217, 219)
      ) aaa
    ) bbb
    WHERE fieldid NOT LIKE '%2C999%'
    
    UNION ALL
    
    SELECT FieldId,
           CurrentLocation,
           ISNULL(Assignment, '') AS Assignment,
           N'АВТОМИВКА' AS ReasonDesc
    FROM (
      SELECT stdTruck.FieldId,
             CurrentLocation,
             CASE WHEN DumpAssignment IS NULL THEN NextShovelAssignment
                  ELSE DumpAssignment END AS Assignment,
             CASE WHEN dn.FieldName IS NOT NULL THEN dn.FieldName
                  WHEN sp.FieldName IS NOT NULL THEN sp.FieldName
                  ELSE '' END AS Reason
      FROM [ISMP_SP_FUNCTION].[dbo].StdTruck() stdTruck
      LEFT JOIN [DBADMINS].ELLOperational.dbo.PITReasondown dn ON stdTruck.FieldReason = dn.FieldId
      LEFT JOIN [DBADMINS].ELLOperational.dbo.PITReasonspare sp ON stdTruck.FieldReason = sp.FieldId
      WHERE [StatusId] IN (216, 218)
        AND CurrentLocation IN (N'АВТОМИВКА', N'OT_284', N'OT_61', N'OT_114', N'KET-1')
        AND stdTruck.FieldId <> '2C999'
    ) bbb
    ORDER BY fieldid
  `);
}

