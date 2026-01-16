import { sqlQuery } from "@/server/database/db";

/**
 * Get the number of loads for each truck for some period.
 */
export async function getLoadsForPeriod(
  StartShiftId: number,
  EndShiftId: number,
): Promise<{ Truck: string; Br: Number }[]> {
  // DECLARE @StartShiftId int = 260101001
  // DECLARE @EndShiftId int = 260111004
  return sqlQuery<{ Truck: string; Br: Number }>(
    `;with shift_loads as (
    SELECT [Load].Id,
            ShiftInfo.Crew,
        ShiftInfo.ShiftId,
        ShiftInfo.FullShiftName,
        [Load].FieldTruck AS TruckId,
        Truck.FieldId AS Truck,
        [Load].FieldExcav AS ExcavId,
        Excav.FieldId AS Excav,
        SUMLoad.PrevDumpId,
        ISNULL([Load].FieldDumprec, SUMLoad.NextDumpId) AS NextShiftDumpId,
        [Load].FieldTons AS Tons,
        Truck.FieldSize AS TruckSize,
        [Load].FieldLsizedb AS LoadfactorValue,
        [Load].FieldLsizetons AS Tonnage,
        SUMLoad.TruckOperId AS TruckOperatorId,
        TruckOper.FieldName AS TruckOperatorName,
        TruckOper.FieldId AS TruckOperId,
        SUMLoad.ExcavOperId AS ExcavOperatorId,
        ExcavOper.FieldName AS ExcavOperatorName,
        ExcavOper.FieldId AS ExcavOperId,
        [Load].FieldLoad AS MaterialTypeID,
        Material.Description AS MaterialType,
        [Load].FieldDist AS TotalDistance,
        [Load].FieldEfh AS EquivalentFlatHaulDistance,
        Material.LoadGroup AS MaterialGroupId,
        Material.LoadGroupName AS MaterialGroupName
    FROM ELLOperational.dbo.SHIFTShiftload AS [Load] WITH (nolock)
        INNER JOIN ELLOperational.Common.ShiftInfo AS ShiftInfo WITH (nolock)
            ON ShiftInfo.ShiftId = [Load].ShiftId
        LEFT OUTER JOIN ELLOperational.NGD4Summary.SUMShiftLoad AS SUMLoad WITH (nolock)
            ON SUMLoad.Id = [Load].Id
        LEFT OUTER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Truck WITH (nolock)
            ON Truck.Id = [Load].FieldTruck
        LEFT OUTER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Excav WITH (nolock)
            ON Excav.Id = [Load].FieldExcav
        LEFT OUTER JOIN ELLOperational.dbo.SHIFTShiftoper AS TruckOper WITH (nolock)
            ON TruckOper.Id = SUMLoad.TruckOperId
        LEFT OUTER JOIN ELLOperational.dbo.SHIFTShiftoper AS ExcavOper WITH (nolock)
            ON ExcavOper.Id = SUMLoad.ExcavOperId
        INNER JOIN ELLOperational.Common.EnumMaterial AS Material WITH (nolock)
            ON Material.Id = [Load].FieldLoad
    WHERE [Load].ShiftId between @StartShiftId and @EndShiftId
    ),

    shift_dumps as (
    SELECT [Dump].Id,
        ShiftInfo.Crew,
        [Dump].ShiftId,
        ShiftInfo.FullShiftName,
        ShiftInfo.ShiftName,
        [Dump].FieldTruck AS TruckId,
        Truck.FieldId AS Truck,
        [Dump].FieldExcav AS ExcavId,
        Excav.FieldId AS Excav,
        SUMDump.PrevLoadId,
        [Dump].FieldLoadrec AS NextShiftLoadId,
        [Dump].FieldTons AS Tons,
        Truck.FieldSize AS TruckSize,
        [Dump].FieldLsizedb AS LoadfactorValue,
        [Dump].FieldLsizetons AS Tonnage,
        [Dump].FieldLoad AS LoadId,
        Material.Description AS MaterialType,
        [Dump].FieldDist AS TotalDistance,
        [Dump].FieldEfh AS EquivalentFlatHaulDistance,
        Material.LoadGroup AS MaterialGroupId,
        SUMDump.TruckOperId AS TruckOperatorId,
        TruckOper.FieldName AS TruckOperatorName,
        TruckOper.FieldId AS TruckOperId
    FROM ELLOperational.dbo.SHIFTShiftdump AS [Dump] WITH (nolock)
        INNER JOIN ELLOperational.Common.ShiftInfo AS ShiftInfo WITH (nolock)
            ON ShiftInfo.ShiftId = [Dump].ShiftId
        LEFT OUTER JOIN ELLOperational.NGD4Summary.SUMShiftDump AS SUMDump WITH (nolock)
            ON SUMDump.Id = [Dump].Id
        INNER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Truck WITH (nolock)
            ON Truck.Id = [Dump].FieldTruck
        LEFT OUTER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Excav WITH (nolock)
            ON Excav.Id = [Dump].FieldExcav
        INNER JOIN ELLOperational.Common.EnumMaterial AS Material WITH (nolock)
            ON Material.Id = [Dump].FieldLoad
        LEFT OUTER JOIN ELLOperational.dbo.SHIFTShiftoper AS TruckOper WITH (nolock)
            ON TruckOper.Id = SUMDump.TruckOperId
    WHERE [Dump].ShiftId between @StartShiftId and @EndShiftId
    )

    SELECT Truck, COUNT(Excav) as Br
    FROM (
        select
            loads.ShiftId,
            loads.FullShiftName,
            loads.Truck,
            loads.TruckOperatorName,
            loads.TruckOperId,
            loads.Excav,
            loads.MaterialType,
            loads.MaterialGroupName
        from shift_loads loads
        LEFT JOIN shift_dumps dumps
            ON loads.NextShiftDumpId = dumps.Id
        WHERE dumps.Id IS NOT NULL
    ) base
    GROUP BY Truck
  `,
    {
      StartShiftId,
      EndShiftId,
    },
    "moddb",
  );
}

/**
 * Get both average cycle/spot/queue times and load counts for each truck in a single query.
 * This is more efficient than running two separate queries.
 */
export async function getTruckTimesAndLoads(
  StartShiftId: number,
  EndShiftId: number,
): Promise<
  {
    Truck: string;
    SpotTime: number;
    QueueTime: number;
    FullCycleTime: number;
    FullCycleTimeMin: number;
    LoadCount: number;
  }[]
> {
  return sqlQuery<{
    Truck: string;
    SpotTime: number;
    QueueTime: number;
    FullCycleTime: number;
    FullCycleTimeMin: number;
    LoadCount: number;
  }>(
    `;with Loads as (
        SELECT [Load].Id,
            [Load].ShiftId,
            [Load].FieldTruck AS TruckId,
            Truck.FieldId AS Truck,
            [Load].FieldExcav AS ExcavId,
            Excav.FieldId AS Excav,
            [Load].FieldLoc AS LoadLocationId,
            Loc.FieldId AS LoadLocation,
            Loc.Unit AS LoadLocationUnit,
            Loc.Region,
            [Load].FieldTons AS Tons,
            Truck.FieldSize AS TruckSize,
            [Load].FieldLsizedb AS LoadfactorValue,
            [Load].FieldLsizetons AS Tonnage,
            SUMLoad.TruckOperId AS TruckOperatorId,
            TruckOper.FieldName AS TruckOperatorName,
            TruckOper.FieldId AS TruckOperId,
            ISNULL([Load].FieldDumprec, SUMLoad.NextDumpId) AS NextShiftDumpId,
            SUMLoad.TruckAssignTimestamp AS AssignTimestamp,
            [Load].FieldCalctravtime AS ExpectedEmptyTravelDuration,
            DATEDIFF(
                        ss,
                        SUMLoad.TruckAssignTimestamp,
                        ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Load].FieldTimearrive)
                    ) - SUMLoad.EmptyTravelNWTime AS EmptyTravelDuration,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Load].FieldTimearrive) AS ArriveTimestamp,
            SUMLoad.TimeSpot - ShiftInfo.ShiftStartTimestamp - [Load].FieldTimearrive - SUMLoad.QueueNWTime AS QueueTime,
            ELLOperational.Common.GetTSBySecs(SUMLoad.TimeSpot) AS SpottingTimestamp,
            ShiftInfo.ShiftStartTimestamp + [Load].FieldTimeload - SUMLoad.TimeSpot - SUMLoad.SpotNWTime AS SpotTime,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Load].FieldTimeload) AS LoadingTimestamp,
            [Load].FieldTimefull - [Load].FieldTimeload - SUMLoad.LoadingNWTime AS LoadingTime,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Load].FieldTimefull) AS FullTimestamp,
            [Load].FieldLoad AS MaterialTypeID,
            [Description] AS MaterialType,
            [Load].FieldDist AS TotalDistance,
            [Load].FieldEfh AS EquivalentFlatHaulDistance,
            SUMLoad.ShovelIdleTime,
            SUMLoad.TruckIdleTime
        FROM ELLOperational.dbo.SHIFTShiftload AS [Load] WITH (nolock)
            INNER JOIN ELLOperational.Common.ShiftInfo AS ShiftInfo WITH (nolock)
                ON ShiftInfo.ShiftId = [Load].ShiftId
            LEFT OUTER JOIN ELLOperational.NGD4Summary.SUMShiftLoad AS SUMLoad WITH (nolock)
                ON SUMLoad.Id = [Load].Id
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Truck WITH (nolock)
                ON Truck.Id = [Load].FieldTruck
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Excav WITH (nolock)
                ON Excav.Id = [Load].FieldExcav
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShiftoper AS TruckOper WITH (nolock)
                ON TruckOper.Id = SUMLoad.TruckOperId
            LEFT OUTER JOIN ELLOperational.std.StdShiftLocations AS Loc WITH (nolock)
                ON Loc.Id = [Load].FieldLoc
            INNER JOIN ELLOperational.Common.EnumMaterial AS Material WITH (nolock)
                ON Material.Id = [Load].FieldLoad
        WHERE [Load].ShiftId between @StartShiftId and @EndShiftId
        ),

        Dumps as (
        SELECT [Dump].Id,
            [Dump].ShiftId,
            [Dump].FieldTruck AS TruckId,
            Truck.FieldId AS Truck,
            [Dump].FieldExcav AS ExcavId,
            Excav.FieldId AS Excav,
            [Dump].FieldGrade AS GradeId,
            SUMDump.PrevLoadId,
            [Dump].FieldLoadrec AS NextShiftLoadId,
            [Dump].FieldTons AS Tons,
            Truck.FieldSize AS TruckSize,
            [Dump].FieldLsizedb AS LoadfactorValue,
            [Dump].FieldLsizetons AS Tonnage,
            SUMDump.TruckFullTimestamp AS AssignTimestamp,
            [Dump].FieldCalctravtime AS ExpectedFullTravelDuration,
            DATEDIFF(
                        ss,
                        SUMDump.TruckFullTimestamp,
                        ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Dump].FieldTimearrive)
                    ) - ISNULL(SUMDump.FullTravelNWTime, 0) AS FullTravelDuration,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Dump].FieldTimearrive) AS ArriveTimestamp,
            [Dump].FieldTimedump - [Dump].FieldTimearrive - SUMDump.QueueNWTime AS QueueTime,
            0 AS SpotTime,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Dump].FieldTimedump) AS DumpingTimestamp,
            [Dump].FieldTimeempty - [Dump].FieldTimedump - SUMDump.DumpingNWTime AS DumpingTime,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Dump].FieldTimeempty) AS EmptyTimestamp,
            [Dump].FieldTimedigest AS DigestionTime,
            [Dump].FieldLoad AS LoadId,
            Material.Description AS MaterialType,
            [Dump].FieldLoadtype AS LoadtypeId,
            [Dump].FieldDist AS TotalDistance,
            [Dump].FieldEfh AS EquivalentFlatHaulDistance,
            SUMDump.TruckOperId AS TruckOperatorId,
            TruckOper.FieldName AS TruckOperatorName,
            TruckOper.FieldId AS TruckOperId

        FROM ELLOperational.dbo.SHIFTShiftdump AS [Dump] WITH (nolock)
            INNER JOIN ELLOperational.Common.ShiftInfo AS ShiftInfo WITH (nolock)
                ON ShiftInfo.ShiftId = [Dump].ShiftId
            LEFT OUTER JOIN ELLOperational.NGD4Summary.SUMShiftDump AS SUMDump WITH (nolock)
                ON SUMDump.Id = [Dump].Id
            INNER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Truck WITH (nolock)
                ON Truck.Id = [Dump].FieldTruck
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Excav WITH (nolock)
                ON Excav.Id = [Dump].FieldExcav
            INNER JOIN ELLOperational.Common.EnumMaterial AS Material WITH (nolock)
                ON Material.Id = [Dump].FieldLoad
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShiftoper AS TruckOper WITH (nolock)
                ON TruckOper.Id = SUMDump.TruckOperId
        WHERE [Dump].ShiftId between @StartShiftId and @EndShiftId
        )

            select 
                Truck,
     			Sum(LoadCount) as LoadCount,
                AVG(SpotTime) as SpotTime,
                AVG(QueueTime) as QueueTime,
                AVG(FullCycleTime) as FullCycleTime,
                AVG(FullCycleTime / 60) as FullCycleTimeMin
            from (
                select 
                    ShiftId, 
                    Truck,
     				COUNT(Truck) as LoadCount,
                    AVG(SpotTime) as SpotTime,
                    AVG(QueueTime) as QueueTime,
                    AVG(FullCycleTime) as FullCycleTime,
                    AVG(FullCycleTime / 60) as FullCycleTimeMin
                from (
                    SELECT 
                        l.Id as LoadId,
                        d.Id as DumpId,
                        l.ShiftId, 
                        l.Truck,
                        l.Excav,
                        l.Region,
                        DATEDIFF(SECOND, l.SpottingTimestamp, l.LoadingTimestamp) as SpotTimeCalc,
                        l.SpotTime, 
                        DATEDIFF(SECOND, l.ArriveTimestamp, l.SpottingTimestamp) as QueueTimeCalc,
                        l.QueueTime,
                        l.TruckIdleTime,
                        l.ShovelIdleTime,
                        (ISNULL(l.EmptyTravelDuration, 0) + ISNULL(l.QueueTime, 0) + ISNULL(l.SpotTime, 0) + ISNULL(l.LoadingTime, 0) + ISNULL(d.FullTravelDuration, 0) + ISNULL(d.DumpingTime, 0) + ISNULL(d.QueueTime, 0) + ISNULL(d.SpotTime, 0)) AS FullCycleTime,
                        DATEDIFF(SECOND, l.AssignTimestamp, d.EmptyTimestamp) as FullTimeCalc
                    FROM Loads l
					LEFT JOIN Dumps d ON l.NextShiftDumpId = d.Id AND d.Id IS NOT NULL
					--INNER JOIN Dumps d on l.NextShiftDumpId = d.Id
                    WHERE RIGHT(l.ShiftId, 3) <> '002'
						and l.Region <> 'LOADERS_REGION'
                )aa
				--WHERE DumpId is NOT NULL
                group by Truck, ShiftId 
            )aaa
            group by Truck
    `,
    {
      StartShiftId,
      EndShiftId,
    },
    "moddb",
  );
}

/**
 * Get the average cycle/spot/queue time for truck.
 * The double avg is for more accurate results from the shift paths.
 */
export async function getTruckTimes(
  StartShiftId: number,
  EndShiftId: number,
): Promise<
  {
    Truck: string;
    SpotTime: number;
    QueueTime: number;
    FullCycleTime: number;
    FullCycleTimeMin: number;
  }[]
> {
  // DECLARE @StartShiftId int = 260101001
  // DECLARE @EndShiftId int = 260111004
  return sqlQuery<{
    Truck: string;
    SpotTime: number;
    QueueTime: number;
    FullCycleTime: number;
    FullCycleTimeMin: number;
  }>(
    `;with Loads as (
        SELECT [Load].Id,
            [Load].ShiftId,
            [Load].FieldTruck AS TruckId,
            Truck.FieldId AS Truck,
            [Load].FieldExcav AS ExcavId,
            Excav.FieldId AS Excav,
            [Load].FieldLoc AS LoadLocationId,
            Loc.FieldId AS LoadLocation,
            Loc.Unit AS LoadLocationUnit,
            Loc.Region,
            [Load].FieldTons AS Tons,
            Truck.FieldSize AS TruckSize,
            [Load].FieldLsizedb AS LoadfactorValue,
            [Load].FieldLsizetons AS Tonnage,
            SUMLoad.TruckOperId AS TruckOperatorId,
            TruckOper.FieldName AS TruckOperatorName,
            TruckOper.FieldId AS TruckOperId,
            ISNULL([Load].FieldDumprec, SUMLoad.NextDumpId) AS NextShiftDumpId,
            SUMLoad.TruckAssignTimestamp AS AssignTimestamp,
            [Load].FieldCalctravtime AS ExpectedEmptyTravelDuration,
            DATEDIFF(
                        ss,
                        SUMLoad.TruckAssignTimestamp,
                        ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Load].FieldTimearrive)
                    ) - SUMLoad.EmptyTravelNWTime AS EmptyTravelDuration,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Load].FieldTimearrive) AS ArriveTimestamp,
            SUMLoad.TimeSpot - ShiftInfo.ShiftStartTimestamp - [Load].FieldTimearrive - SUMLoad.QueueNWTime AS QueueTime,
            ELLOperational.Common.GetTSBySecs(SUMLoad.TimeSpot) AS SpottingTimestamp,
            ShiftInfo.ShiftStartTimestamp + [Load].FieldTimeload - SUMLoad.TimeSpot - SUMLoad.SpotNWTime AS SpotTime,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Load].FieldTimeload) AS LoadingTimestamp,
            [Load].FieldTimefull - [Load].FieldTimeload - SUMLoad.LoadingNWTime AS LoadingTime,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Load].FieldTimefull) AS FullTimestamp,
            [Load].FieldLoad AS MaterialTypeID,
            [Description] AS MaterialType,
            [Load].FieldDist AS TotalDistance,
            [Load].FieldEfh AS EquivalentFlatHaulDistance,
            SUMLoad.ShovelIdleTime,
            SUMLoad.TruckIdleTime
        FROM ELLOperational.dbo.SHIFTShiftload AS [Load] WITH (nolock)
            INNER JOIN ELLOperational.Common.ShiftInfo AS ShiftInfo WITH (nolock)
                ON ShiftInfo.ShiftId = [Load].ShiftId
            LEFT OUTER JOIN ELLOperational.NGD4Summary.SUMShiftLoad AS SUMLoad WITH (nolock)
                ON SUMLoad.Id = [Load].Id
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Truck WITH (nolock)
                ON Truck.Id = [Load].FieldTruck
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Excav WITH (nolock)
                ON Excav.Id = [Load].FieldExcav
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShiftoper AS TruckOper WITH (nolock)
                ON TruckOper.Id = SUMLoad.TruckOperId
            LEFT OUTER JOIN ELLOperational.std.StdShiftLocations AS Loc WITH (nolock)
                ON Loc.Id = [Load].FieldLoc
            INNER JOIN ELLOperational.Common.EnumMaterial AS Material WITH (nolock)
                ON Material.Id = [Load].FieldLoad
        WHERE [Load].ShiftId between @StartShiftId and @EndShiftId
        ),

        Dumps as (
        SELECT [Dump].Id,
            [Dump].ShiftId,
            [Dump].FieldTruck AS TruckId,
            Truck.FieldId AS Truck,
            [Dump].FieldExcav AS ExcavId,
            Excav.FieldId AS Excav,
            [Dump].FieldGrade AS GradeId,
            SUMDump.PrevLoadId,
            [Dump].FieldLoadrec AS NextShiftLoadId,
            [Dump].FieldTons AS Tons,
            Truck.FieldSize AS TruckSize,
            [Dump].FieldLsizedb AS LoadfactorValue,
            [Dump].FieldLsizetons AS Tonnage,
            SUMDump.TruckFullTimestamp AS AssignTimestamp,
            [Dump].FieldCalctravtime AS ExpectedFullTravelDuration,
            DATEDIFF(
                        ss,
                        SUMDump.TruckFullTimestamp,
                        ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Dump].FieldTimearrive)
                    ) - ISNULL(SUMDump.FullTravelNWTime, 0) AS FullTravelDuration,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Dump].FieldTimearrive) AS ArriveTimestamp,
            [Dump].FieldTimedump - [Dump].FieldTimearrive - SUMDump.QueueNWTime AS QueueTime,
            0 AS SpotTime,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Dump].FieldTimedump) AS DumpingTimestamp,
            [Dump].FieldTimeempty - [Dump].FieldTimedump - SUMDump.DumpingNWTime AS DumpingTime,
            ELLOperational.Common.GetTSBySecs(ShiftInfo.ShiftStartTimestamp + [Dump].FieldTimeempty) AS EmptyTimestamp,
            [Dump].FieldTimedigest AS DigestionTime,
            [Dump].FieldLoad AS LoadId,
            Material.Description AS MaterialType,
            [Dump].FieldLoadtype AS LoadtypeId,
            [Dump].FieldDist AS TotalDistance,
            [Dump].FieldEfh AS EquivalentFlatHaulDistance,
            SUMDump.TruckOperId AS TruckOperatorId,
            TruckOper.FieldName AS TruckOperatorName,
            TruckOper.FieldId AS TruckOperId

        FROM ELLOperational.dbo.SHIFTShiftdump AS [Dump] WITH (nolock)
            INNER JOIN ELLOperational.Common.ShiftInfo AS ShiftInfo WITH (nolock)
                ON ShiftInfo.ShiftId = [Dump].ShiftId
            LEFT OUTER JOIN ELLOperational.NGD4Summary.SUMShiftDump AS SUMDump WITH (nolock)
                ON SUMDump.Id = [Dump].Id
            INNER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Truck WITH (nolock)
                ON Truck.Id = [Dump].FieldTruck
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShifteqmt AS Excav WITH (nolock)
                ON Excav.Id = [Dump].FieldExcav
            INNER JOIN ELLOperational.Common.EnumMaterial AS Material WITH (nolock)
                ON Material.Id = [Dump].FieldLoad
            LEFT OUTER JOIN ELLOperational.dbo.SHIFTShiftoper AS TruckOper WITH (nolock)
                ON TruckOper.Id = SUMDump.TruckOperId
        WHERE [Dump].ShiftId between @StartShiftId and @EndShiftId
        )

        select 
            Truck,
            AVG(SpotTime) as SpotTime,
            AVG(QueueTime) as QueueTime,
            AVG(FullCycleTime) as FullCycleTime,
            AVG(FullCycleTime / 60) as FullCycleTimeMin
        from (
            select 
                ShiftId, 
                --Region,
                Truck,
                AVG(SpotTime) as SpotTime,
                AVG(QueueTime) as QueueTime,
                AVG(FullCycleTime) as FullCycleTime,
                AVG(FullCycleTime / 60) as FullCycleTimeMin
            from (
                SELECT 
                    l.Id as LoadId,
                    l.ShiftId, 
                    l.Truck,
                    l.Excav,
                    l.Region,
                    DATEDIFF(SECOND, l.SpottingTimestamp, l.LoadingTimestamp) as SpotTimeCalc,
                    l.SpotTime, 
                    DATEDIFF(SECOND, l.ArriveTimestamp, l.SpottingTimestamp) as QueueTimeCalc,
                    l.QueueTime,
                    l.TruckIdleTime,
                    l.ShovelIdleTime,
                    (ISNULL(l.EmptyTravelDuration, 0) + ISNULL(l.QueueTime, 0) + ISNULL(l.SpotTime, 0) + ISNULL(l.LoadingTime, 0) + ISNULL(d.FullTravelDuration, 0) + ISNULL(d.DumpingTime, 0) + ISNULL(d.QueueTime, 0) + ISNULL(d.SpotTime, 0)) AS FullCycleTime,
                    DATEDIFF(SECOND, l.AssignTimestamp, d.EmptyTimestamp) as FullTimeCalc
                FROM Loads l
                LEFT JOIN Dumps d on l.NextShiftDumpId = d.Id
                WHERE l.ShiftId not like '%002' 
                        and l.Region <> 'LOADERS_REGION'
            )aa
            group by Truck, ShiftId 
        )aaa
        group by Truck
        order by Truck
    `,
    {
      StartShiftId,
      EndShiftId,
    },
    "moddb",
  );
}
