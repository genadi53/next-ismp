import { sqlQuery } from "@/server/database/db";
import type {
  ProductionPlan,
  ExcavProductionDetailed,
  ExcavVol,
} from "./types.production";

/**
 * Get production plan data for the current shift day.
 */
export async function getProductionPlan(): Promise<ProductionPlan[]> {
  // Get shift day in the format used by the production plan
  const now = new Date();
  const hour = now.getHours();
  // Shift changes at 6:30 and 18:30
  const shiftDate =
    hour < 7 ? new Date(now.getTime() - 24 * 60 * 60 * 1000) : now;
  const shDay = shiftDate.toISOString().split("T")[0];

  return sqlQuery<ProductionPlan>(
    `
    SELECT *
    FROM [ELLDBAdmins].[dashboards].[ProductionPlanStat]
    WHERE shDay = @shDay
  `,
    { shDay },
  );
}

/**
 * Get detailed excavator production data for the current shift.
 * Includes volume, tonnage, truck assignments and travel distances.
 */
export async function getExcavProductionDetailed(): Promise<
  ExcavProductionDetailed[]
> {
  return sqlQuery<ExcavProductionDetailed>(`
    DECLARE @CurShift INT = (SELECT MAX(ShiftId) FROM [ISMP_SP_FUNCTION].[dbo].ShiftList());
    
    ;WITH Base AS (
      SELECT Truck.Id,
             Truck.FieldId,
             Truck.FieldExcavnext AS NextShovelAssignmentId,
             Excav.FieldId AS NextShovelAssignment,
             Truck.FieldDumpasn AS DumpAssignmentId,
             Truck.FieldStatus AS StatusId,
             Pitloc.FieldId AS DumpAssignment,
             Truck.FieldLastexcav AS LastExcavId,
             Excav3.FieldId AS LastExcav,
             Truck.FieldActlast AS ActlastId,
             Actlast.Description AS Actlast,
             Truck.FieldActnext AS ActnextId,
             Actnext.Description AS Actnext
      FROM [DBADMINS].ELLOperational.dbo.PITTruck AS Truck WITH (NOLOCK)
      LEFT JOIN [DBADMINS].ELLOperational.dbo.Enum AS Actlast WITH (NOLOCK) ON Actlast.Id = Truck.FieldActlast
      LEFT JOIN [DBADMINS].ELLOperational.dbo.Enum AS Actnext WITH (NOLOCK) ON Actnext.Id = Truck.FieldActnext
      LEFT JOIN [DBADMINS].ELLOperational.dbo.PITExcav AS Excav WITH (NOLOCK) ON Excav.Id = Truck.FieldExcavnext
      LEFT JOIN [DBADMINS].ELLOperational.dbo.PITPitloc AS Pitloc WITH (NOLOCK) ON Pitloc.Id = Truck.FieldDumpasn
      LEFT JOIN [DBADMINS].ELLOperational.dbo.PITExcav AS Excav3 WITH (NOLOCK) ON Excav3.Id = Truck.FieldLastexcav
      WHERE Truck.FieldStatus IN (217, 219)
    ),
    TrucksTravel AS (
      SELECT FieldId,
             NextShovelAssignment,
             NextShovelAssignmentId,
             DumpAssignment,
             DumpAssignmentId,
             LastExcav,
             LastExcavId,
             Actnext,
             Actlast,
             CASE WHEN Actlast = N'ПЪРВА КОФА' AND Actnext = N'ПЪЛЕН' THEN 'Loading'
                  WHEN Actlast = N'ПРИСТИГАНЕ' AND Actnext = N'ПЪРВА КОФА' THEN 'Queue'
                  WHEN DumpAssignment IS NOT NULL THEN 'toDump'
                  WHEN NextShovelAssignment IS NOT NULL THEN 'toShovel'
                  ELSE 'unknown' END AS TravelTo
      FROM Base
      WHERE StatusId IN (217, 219)
    ),
    ShovWork AS (
      SELECT Excav,
             Shoptype,
             DumpLocation,
             LoadLocation,
             ROUND(SUM(Br), 0) AS Br,
             ROUND(SUM(Ton), 0) AS Ton,
             ROUND(SUM(Vol), 0) AS Vol,
             ROUND(AVG(Cu), 3) AS Cu,
             ROUND(AVG(EndTotalDist), 3) AS FieldDist
      FROM [ISMP_SP_FUNCTION].[dbo].[Function_Marckshaideri](@CurShift, @CurShift)
      WHERE Shoptype IS NOT NULL
        AND DumpLocationid <> 0
        AND EndTotalDist IS NOT NULL
      GROUP BY Excav, Shoptype, DumpLocation, LoadLocation
    ),
    TruckTravAgg AS (
      SELECT LastExcav AS Excav,
             SUM(CASE WHEN TravelTo = 'toShovel' THEN 1 ELSE 0 END) AS toShovel,
             SUM(CASE WHEN TravelTo = 'toDump' THEN 1 ELSE 0 END) AS toDump,
             SUM(CASE WHEN TravelTo = 'Queue' THEN 1 ELSE 0 END) AS [Queue],
             SUM(CASE WHEN TravelTo = 'Loading' THEN 1 ELSE 0 END) AS Loading
      FROM TrucksTravel
      WHERE TravelTo <> 'unknown'
      GROUP BY LastExcav
    )
    SELECT s.Excav,
           s.LoadLocation,
           s.DumpLocation,
           s.Br,
           s.Ton,
           s.Vol,
           s.Shoptype,
           ISNULL(t.toShovel, 0) AS toShovel,
           ISNULL(t.toDump, 0) AS toDump,
           ISNULL(t.[Queue], 0) AS [Queue],
           ISNULL(t.Loading, 0) AS Loading,
           ROUND(ISNULL(s.FieldDist * 1000, 0), 0) AS FieldDist,
           SUM(s.Vol) OVER (PARTITION BY s.Excav, s.DumpLocation) AS vol_shov_rp,
           s.Cu
    FROM ShovWork AS s
    LEFT JOIN TruckTravAgg AS t ON t.Excav = s.Excav
    ORDER BY s.Excav, s.DumpLocation
  `);
}

/**
 * Get excavator volume data for the current shift.
 */
export async function getExcavVol(): Promise<ExcavVol[]> {
  return sqlQuery<ExcavVol>(`
    DECLARE @CurShift INT;
    SELECT @CurShift = MAX(ShiftId) FROM [ISMP_SP_FUNCTION].[dbo].ShiftList();
    
    SELECT ExcavName,
           DumpLocation,
           ROUND(SUM(Vol), 0) AS Vol
    FROM [ISMP_SP_FUNCTION].[dbo].[Function_Geology](@CurShift, @CurShift)
    WHERE Shoptype IS NOT NULL AND DumpLocationId IS NOT NULL
    GROUP BY ExcavName, Shoptype, DumpLocation
    ORDER BY ExcavName, DumpLocation, Shoptype DESC
  `);
}

