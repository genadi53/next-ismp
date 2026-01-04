import { sqlQuery } from "@/server/database/db";
import type {
  PrestartTruck,
  PrestartExcavator,
  PrestartShovel,
} from "./types.equipment";

/**
 * Get all trucks for prestart checklist.
 */
export async function getPrestartTrucks(): Promise<PrestartTruck[]> {
  return sqlQuery<PrestartTruck>(`
    ;WITH regions AS (
      SELECT * 
      FROM [DBADMINS].ELLOperational.dbo.PITPitloc AS pitloc WITH(NOLOCK) 
      WHERE pitloc.FieldPit > -1 AND pitloc.FieldRegion = -1
    ),
    truckData AS (
      SELECT a.FieldId, 
             a.FieldSize, 
             a.FieldFueltank - a.FieldFuelamt AS FuelRemaining, 
             ISNULL(a.FieldFueltank, 0) FieldFueltank, 
             a.FieldFuelamt, 
             a.FieldStatus,
             [Status].[Description] [Status], 
             [Load].[Description] [Load], 
             a.FieldLogin LoginId,
             CASE WHEN a.FieldLogin = 53 THEN 'yes'
                  WHEN a.FieldLogin = 49 THEN 'no'
                  ELSE 'unkown' END AS haveOperator,
             pitloc.FieldId AS Tiedown, 
             a.FieldEnghr,
             [loc].FieldId CurrentLocation,
             a.FieldRegionlock,
             reg.FieldId AS Region,
             a.FieldDumplock,
             a.FieldExcavlock,
             DumpLock.FieldId AS DumpLock,
             excav.FieldId AS ExcavLock,
             EnumLpT.[Description] AS LpType
      FROM [DBADMINS].ELLOperational.dbo.PitTruck a WITH(NOLOCK)
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.PitTruckTiedownArray AS [PitTruckTiedown] WITH(NOLOCK) 
        ON [PitTruckTiedown].Id = a.Id AND [PitTruckTiedown].[Index] = 0
      LEFT OUTER JOIN [DBADMINS].ELLOperational.std.StdPitloc pitloc WITH(NOLOCK)
        ON [PitTruckTiedown].[Value] = pitloc.Id
      LEFT OUTER JOIN [DBADMINS].ELLOperational.Common.EnumSTATUS AS [Status] WITH(NOLOCK) 
        ON [Status].Id = a.FieldStatus
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.PITPitloc AS [loc] WITH(NOLOCK) 
        ON [loc].Id = a.FieldLoc
      LEFT JOIN regions reg ON loc.FieldRegion = reg.Id
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.Enum AS [Load] WITH(NOLOCK) 
        ON [Load].Id = a.FieldLoad
      LEFT JOIN [DBADMINS].[ELLOperational].[Common].[EnumLPTRUCK] EnumLpT ON a.FieldLpeqmt = EnumLpT.Idx
      LEFT JOIN [DBADMINS].[ELLOperational].dbo.PITExcav excav ON a.FieldExcavlock = excav.Id
      LEFT JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc DumpLock ON a.FieldDumplock = DumpLock.Id
      WHERE a.FieldId <> N'2C999'
    )
    SELECT * FROM truckData
    ORDER BY FieldId
  `);
}

/**
 * Get all excavators for prestart checklist.
 */
export async function getPrestartExcavators(): Promise<PrestartExcavator[]> {
  return sqlQuery<PrestartExcavator>(`
    ;WITH regions AS (
      SELECT * 
      FROM [DBADMINS].ELLOperational.dbo.PITPitloc AS pitloc WITH(NOLOCK) 
      WHERE pitloc.FieldPit > -1 AND pitloc.FieldRegion = -1
    ),
    excavData AS (
      SELECT a.FieldId, 
             a.FieldSize, 
             a.FieldStatus,
             [Status].[Description] [Status], 
             a.FieldLogin LoginId,
             CASE WHEN a.FieldLogin = 53 THEN 'yes'
                  WHEN a.FieldLogin = 49 THEN 'no'
                  ELSE 'unkown' END AS haveOperator,
             pitloc.FieldId AS Tiedown, 
             a.FieldEnghr,
             [loc].FieldId CurrentLocation,
             a.FieldRegionlock,
             reg.FieldId AS Region,
             a.FieldDumplock,
             DumpLock.FieldId AS DumpLock,
             a.FieldExcavlock,
             excav.FieldId AS ExcavLock,
             EnumLpT.[Description] AS LpType
      FROM [DBADMINS].ELLOperational.dbo.PitExcav a WITH(NOLOCK)
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.PITExcavTiedownArray AS [PitTruckTiedown] WITH(NOLOCK) 
        ON [PitTruckTiedown].Id = a.Id AND [PitTruckTiedown].[Index] = 0
      LEFT OUTER JOIN [DBADMINS].ELLOperational.std.StdPitloc pitloc WITH(NOLOCK)
        ON [PitTruckTiedown].[Value] = pitloc.Id
      LEFT OUTER JOIN [DBADMINS].ELLOperational.Common.EnumSTATUS AS [Status] WITH(NOLOCK) 
        ON [Status].Id = a.FieldStatus
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.PITPitloc AS [loc] WITH(NOLOCK) 
        ON [loc].Id = a.FieldLoc
      LEFT JOIN regions reg ON loc.FieldRegion = reg.Id
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.Enum AS [Load] WITH(NOLOCK) 
        ON [Load].Id = a.FieldLoad
      LEFT JOIN [DBADMINS].[ELLOperational].[Common].[EnumLPTRUCK] EnumLpT ON a.FieldLpeqmt = EnumLpT.Idx
      LEFT JOIN [DBADMINS].[ELLOperational].dbo.PITExcav excav ON a.FieldExcavlock = excav.Id
      LEFT JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc DumpLock ON a.FieldDumplock = DumpLock.Id
      WHERE a.FieldId NOT IN (N'2B998', N'2BРЦ')
    )
    SELECT * FROM excavData
    ORDER BY FieldId
  `);
}

/**
 * Get all shovels for prestart checklist with detailed info.
 */
export async function getPrestartShovels(): Promise<PrestartShovel[]> {
  return sqlQuery<PrestartShovel>(`
    ;WITH regions AS (
      SELECT * 
      FROM [DBADMINS].ELLOperational.dbo.PITPitloc AS pitloc WITH(NOLOCK) 
      WHERE pitloc.FieldPit > -1 AND pitloc.FieldRegion = -1
    ),
    bars_excav AS (
      SELECT Excav, 
             STRING_AGG(Truck, ', ') WITHIN GROUP (ORDER BY Excav) allTrucks
      FROM (
        SELECT bars.Id,
               bars.[FieldId],
               bars.[FieldTruck],
               truck.FieldId AS Truck,
               bars.[FieldExcav],
               excav.FieldId AS Excav
        FROM [DBADMINS].[ELLOperational].[dbo].[PITBar] bars
        LEFT JOIN [DBADMINS].[ELLOperational].dbo.PITTruck truck ON bars.FieldTruck = truck.Id
        LEFT JOIN [DBADMINS].[ELLOperational].dbo.PITExcav excav ON bars.FieldExcav = excav.Id
      ) bars
      GROUP BY Excav
    ),
    excavData AS (
      SELECT a.FieldId, 
             a.FieldSize, 
             a.FieldStatus,
             [Status].[Description] [Status], 
             a.FieldLogin LoginId,
             CASE WHEN a.FieldLogin = 53 THEN 'yes'
                  WHEN a.FieldLogin = 49 THEN 'no'
                  ELSE 'unkown' END AS haveOperator,
             pitloc.FieldId AS Tiedown, 
             a.FieldEnghr,
             [loc].FieldId CurrentLocation,
             grade.FieldId AS Grade, 
             reg.FieldId AS Region,
             a.FieldRegionlock,
             lockReg.FieldId AS RegionLock,
             a.FieldDumplock,
             a.FieldDiglock,
             LoadLock.FieldId AS LoadLock,
             DumpLock.FieldId AS DumpLock,
             a.FieldExcavlock,
             excav.FieldId AS ExcavLock,
             EnumLpT.[Description] AS LpType,
             bars_excav.allTrucks AS BarTrucks
      FROM [DBADMINS].ELLOperational.dbo.PitExcav a WITH(NOLOCK)
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.PITExcavTiedownArray AS [PitTruckTiedown] WITH(NOLOCK) 
        ON [PitTruckTiedown].Id = a.Id AND [PitTruckTiedown].[Index] = 0
      LEFT OUTER JOIN [DBADMINS].ELLOperational.std.StdPitloc pitloc WITH(NOLOCK)
        ON [PitTruckTiedown].[Value] = pitloc.Id
      LEFT OUTER JOIN [DBADMINS].ELLOperational.Common.EnumSTATUS AS [Status] WITH(NOLOCK) 
        ON [Status].Id = a.FieldStatus
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.PITPitloc AS [loc] WITH(NOLOCK) 
        ON [loc].Id = a.FieldLoc
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.PITGrade AS [grade] WITH(NOLOCK) 
        ON [loc].Id = [grade].FieldLoc
      LEFT JOIN regions reg ON loc.FieldRegion = reg.Id
      LEFT JOIN regions lockReg ON a.FieldRegionlock = lockReg.Id
      LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.Enum AS [Load] WITH(NOLOCK) 
        ON [Load].Id = a.FieldLoad
      LEFT JOIN [DBADMINS].[ELLOperational].[Common].[EnumLPEXCAV] EnumLpT ON a.FieldLpeqmt = EnumLpT.Idx
      LEFT JOIN [DBADMINS].[ELLOperational].dbo.PITExcav excav WITH(NOLOCK) ON a.FieldExcavlock = excav.Id
      LEFT JOIN [DBADMINS].[ELLOperational].dbo.PITPitloc DumpLock WITH(NOLOCK) ON a.FieldDumplock = DumpLock.Id
      LEFT JOIN [DBADMINS].ELLOperational.dbo.PITPitloc LoadLock WITH(NOLOCK) ON a.FieldDiglock = LoadLock.Id
      LEFT JOIN bars_excav ON a.FieldId = bars_excav.Excav
      WHERE a.FieldId NOT IN (N'2B998', N'2BРЦ')
    )
    SELECT * FROM excavData ORDER BY FieldId
  `);
}

