import { sqlQuery } from "@/server/database/db";
import { appendFileSync } from "fs";

/**
 * Get the current production data for the given shift range.
 */
export async function getCurrentProduction(
  StartShiftId: number,
  EndShiftId: number,
): Promise<
  {
    ShiftId: number;
    Br_Ore: number;
    Br_Waste: number;
    Vol_Ore: number;
    Vol_Waste: number;
    Tons_Ore: number;
    Tons_Waste: number;
    Tonkm_Ore: number;
    Tonkm_Waste: number;
    Br_Total: number;
    Tons_Total: number;
    Vol_Total: number;
    Tonkm_Total: number;
    PlanVolOreKet: number;
    PlanmassOreKet: number;
    PlanVolWaste: number;
    PlanMassWaste: number;
  }[]
> {
  // #region agent log
  const logPath = "d:\\code\\ISMP Portal\\next-ismp\\.cursor\\debug.log";
  const queryStartTime = Date.now();
  try {
    appendFileSync(
      logPath,
      JSON.stringify({
        location: "production.repository.ts:32",
        message: "getCurrentProduction called",
        data: {
          StartShiftId,
          EndShiftId,
          StartShiftIdType: typeof StartShiftId,
          EndShiftIdType: typeof EndShiftId,
          queryStartTime,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A,B,C,D,E",
      }) + "\n",
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {}
  // #endregion

  let result;
  // #region agent log
  const sqlQueryStartTime = Date.now();
  try {
    appendFileSync(
      logPath,
      JSON.stringify({
        location: "production.repository.ts:56",
        message: "sqlQuery starting",
        data: {
          timeSinceFunctionStart: sqlQueryStartTime - queryStartTime,
          sqlQueryStartTime,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A,B,C,D,E",
      }) + "\n",
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {}
  // #endregion
  try {
    result = await sqlQuery<{
      ShiftId: number;
      Br_Ore: number;
      Br_Waste: number;
      Vol_Ore: number;
      Vol_Waste: number;
      Tons_Ore: number;
      Tons_Waste: number;
      Tonkm_Ore: number;
      Tonkm_Waste: number;
      Br_Total: number;
      Tons_Total: number;
      Vol_Total: number;
      Tonkm_Total: number;
      PlanVolOreKet: number;
      PlanmassOreKet: number;
      PlanVolWaste: number;
      PlanMassWaste: number;
    }>(
      `declare @MarkTable table (
            Shiftid bigint null,
            WorkingYear int null,
            FullShiftName nvarchar(50) null,
            [MaterialId] bigint null,
            [Material] nvarchar(30) null,
            LoadLocationId bigint null,
            LoadLocation nvarchar(30) null,
            Horiz float NULL,
            DumpHoriz float NULL,
            DumpLocationId bigint NULL,
            DumpLocation nvarchar(50) null,
            DumpLocationUnit nvarchar(50) NULL,
            Truck nvarchar(50) NULL,
            TruckType nvarchar(50) NULL,
            TruckObjectNew int NULL,
            TruckObject nvarchar(50) NULL,
            Excav nvarchar(10) NULL,
            ExcavObject int NULL,
            ExcavObjectNew nvarchar(30) NULL,
            ExcavType nvarchar(50) NULL,
            TruckOperId nvarchar(30) NULL,
            TruckOperatorName nvarchar(100) NULL,
            Br int NULL,
            Ton float NULL,
            Vol float NULL,
            [avgDumpDist] float NULL,
            [EndTotalDist] float NULL,
            [Tonkm] float NULL,
            [TonkmReal] float NULL,
            [EndTotalDistRP] float NULL,
            [DumpTotalDist] float NULL,
            [RealTotalDist] float NULL,
            [LoadTotalDist] float NULL,
            [FieldShoptype] nvarchar(30) NULL,
            ShopType nvarchar(50) NULL,
            G_on_ELL int NULL,
            [FieldLoad] int NULL,
            [MaterialDensity] float NULL,
            density float NULL,
            Cu float NULL,
            MetalTon float NULL,
            sssRP int NULL,
            DistTRZint int NULL,
            TruckTypeID int NULL
        )

        insert into @MarkTable
        ;with TRUCK_MAT AS (
        SELECT TruckMat.TRUCK,
                TruckMat.[WYear],
                TruckMat.TRUCK_SIZE,
                TruckMat.GRA,
                TruckMat.GRAP,
                TruckMat.POR,
                TruckMat.PORP,
                TruckMat.SHI,
                TruckMat.SHIP,
                TruckMat.MDP,
                TruckMat.MATERIALDEF
        FROM [ELLDBAdmins].[dbo].TRUCK_MATERIAL_SIZE_NEW AS TruckMat WITH (NOLOCK)
        ),

        PITLOC AS (
        SELECT Pitloc.Id,
            Pitloc.FieldId,
            Pitloc.FieldPit,
            Pitloc1.FieldId AS PitName,
            Pitloc.FieldRegion,
            Pitloc2.FieldId AS RegionName,
            Pitloc.FieldBlendrec,
            Pitloc.FieldPath,
            Pitloc.FieldBean,
            Pitloc.FieldInvbean,
            Pitloc.FieldHaul,
            Pitloc.FieldOre,
            Pitloc.FieldDumpfeed,
            Pitloc.FieldDumpcapy,
            Pitloc.FieldBinsize,
            Pitloc.FieldXloc,
            Pitloc.FieldYloc,
            Pitloc.FieldPathix,
            Pitloc.FieldTimedump,
            Pitloc.FieldZloc,
            Pitloc.FieldSignid,
            Pitloc.FieldUnit,
            Pitloc.FieldSpillage,
            Pitloc.FieldSignpost,
            Pitloc.FieldShoptype,
            EnumShop.Description AS Shoptype
        FROM [DBADMINS].ELLOperational.dbo.PITPitloc AS Pitloc WITH (NOLOCK)
        LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.PITPitloc AS Pitloc1 WITH (NOLOCK)
            ON Pitloc1.Id = Pitloc.FieldPit
        LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.PITPitloc AS Pitloc2 WITH (NOLOCK)
            ON Pitloc2.Id = Pitloc.FieldRegion
        LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.Enum AS EnumShop WITH (NOLOCK)
            ON EnumShop.Id = Pitloc.FieldShoptype
        ),

        StdLoads AS (
        SELECT StdLoads.TruckId AS TruckId,
        StdLoads.Truck,
        StdLoads.Excav,
        StdLoads.Truck AS TruckName,
        StdLoads.Eqmttype AS TruckType,
        StdLoads.EqmttypeId AS TruckTypeID,
        StdLoads.ExcavId AS ExcavId,
        StdLoads.ExcavType,
        StdLoads.GradeId AS GradeId,
        StdLoads.Id AS LoadId,
        StdLoads.ShiftId AS ShiftId,
        StdLoads.FullShiftName,
        StdLoads.Crew,
        ISNULL(StdLoads.LoadLocationId, 0) AS LoadLocationId,
        StdLoads.LoadLocation AS LoadLocation,
        StdLoads.Elevation AS Horiz,
        StdLoads.NextShiftDumpId,
        StdLoads.MaterialGroupId AS MaterialId,
        StdLoads.MaterialGroupName AS Material,
        StdLoads.TruckSize AS TruckSize,
        year(cast(left(StdLoads.ShiftId,6) as date)) AS WorkingYear,
        FieldLoad
        FROM (
        SELECT [Load].Id,
            ShiftInfo.ShiftStartDateTime AS ShiftStartTimestamp,
            DATEADD(ss, ShiftInfo.ShiftDuration, ShiftInfo.ShiftStartDateTime) AS ShiftEndTimestamp,
            ShiftInfo.Crew,
            ShiftInfo.ShiftId,
            ShiftInfo.FullShiftName,
            ShiftInfo.ShiftName,
            [Load].FieldTruck AS TruckId,
            Truck.FieldId AS Truck,
            Truck.Eqmttype,
            Truck.EqmttypeId,
            [Load].FieldExcav AS ExcavId,
            Excav.FieldId AS Excav,
            Excav.Eqmttype AS ExcavType,
            [Load].FieldGrade AS GradeId,
            Grade.FieldId AS Grade,
            [Load].FieldLoc AS LoadLocationId,
            Loc.FieldId AS LoadLocation,
            Loc.Unit AS LoadLocationUnit,
            loc.Elevation,
            ISNULL([Load].FieldDumprec, 0) AS NextShiftDumpId,
            [Load].FieldTons AS Tons,
            Truck.FieldSize AS TruckSize,
            [Load].FieldLsizedb AS LoadfactorValue,
            [Load].FieldLsizetons AS Tonnage,
            [Load].FieldLoad AS MaterialTypeID,
            Material.Description AS MaterialType,
            Material.LoadGroup AS MaterialGroupId,
            Material.Units AS MaterialUnits,
            Material.LoadGroupName AS MaterialGroupName,
            [Load].FieldLoad
        FROM [DBADMINS].ELLOperational.dbo.SHIFTShiftload AS [Load] WITH (NOLOCK)
            INNER JOIN [DBADMINS].ELLOperational.Common.ShiftInfo AS ShiftInfo WITH (NOLOCK)
                ON ShiftInfo.ShiftId = [Load].ShiftId
            LEFT OUTER JOIN [DBADMINS].[ELLOperational].[std].StdShifteqmt AS Truck WITH (NOLOCK)
                ON Truck.Id = [Load].FieldTruck
            LEFT OUTER JOIN [DBADMINS].[ELLOperational].[std].StdShifteqmt AS Excav WITH (NOLOCK)
                ON Excav.Id = [Load].FieldExcav
            LEFT OUTER JOIN [DBADMINS].ELLOperational.dbo.SHIFTShiftgrade AS Grade WITH (NOLOCK)
                ON Grade.Id = [Load].FieldGrade
            LEFT OUTER JOIN [DBADMINS].ELLOperational.std.StdShiftLocations AS Loc WITH (NOLOCK)
                ON Loc.Id = [Load].FieldLoc
            LEFT JOIN [DBADMINS].ELLOperational.Common.EnumMaterial AS Material WITH (NOLOCK)
                ON Material.Id = [Load].FieldLoad
        WHERE [Load].shiftid BETWEEN @StartShiftId AND @EndShiftId
        ) AS StdLoads
        ),

        StdDumps AS (
        SELECT StdDumps.TruckId AS TruckId,
            StdDumps.Truck AS TruckName,
            StdDumps.ExcavId AS ExcavId,
            StdDumps.GradeId AS GradeId,
            StdDumps.Id AS DumpId,
            StdDumps.ShiftId AS DumpShiftId,
            ISNULL(StdDumps.DumpLocationId, 0) AS DumpLocationId,
            StdDumps.DumpLocation,
            StdDumps.DumpLocationUnit,
            StdDumps.Elevation AS DumpHoriz,
            StdDumps.NextShiftLoadId,
            [FieldShoptype],
            [Shoptype]
        FROM (
            SELECT [Dump].Id,
                ShiftInfo.Crew,
                [Dump].ShiftId,
                ShiftInfo.FullShiftName,
                ShiftInfo.ShiftName,
                [Dump].FieldTruck AS TruckId,
                Truck.FieldId AS Truck,
                [Dump].FieldExcav AS ExcavId,
                Excav.FieldId AS Excav,
                [Dump].FieldGrade AS GradeId,
                Grade.FieldId AS Grade,
                [Dump].FieldLoc AS DumpLocationId,
                Loc.FieldId AS DumpLocation,
                Loc.Unit AS DumpLocationUnit,
                Loc.UnitType AS DumpLocationUnitType,
                loc.Elevation,
                [Dump].FieldBlast AS BlastLocationId,
                Blast.FieldId AS BlastLocation,
                [Dump].FieldLoadrec AS NextShiftLoadId,
                [Dump].FieldTons AS Tons,
                Truck.FieldSize AS TruckSize,
                [Dump].FieldLsizedb AS LoadfactorValue,
                [Dump].FieldLsizetons AS Tonnage,
                [Dump].FieldLoad AS LoadId,
                Material.Description AS MaterialType,
                Material.IsOre,
                Material.IsWaste,
                [Dump].FieldLoadtype AS LoadtypeId,
                [Dump].FieldExtraload AS IsExtraload,
                Material.LoadGroup AS MaterialGroupId
            FROM [DBADMINS].ELLOperational.dbo.SHIFTShiftdump AS [Dump] WITH (NOLOCK)
                INNER JOIN [DBADMINS].ELLOperational.Common.ShiftInfo AS ShiftInfo WITH (NOLOCK)
                    ON ShiftInfo.ShiftId = [Dump].ShiftId
                  INNER JOIN [DBADMINS].[ELLOperational].[std].[StdShifteqmt] AS Truck WITH (NOLOCK)
                    ON Truck.Id = [Dump].FieldTruck
                LEFT OUTER JOIN [DBADMINS].[ELLOperational].[std].StdShifteqmt AS Excav WITH (NOLOCK)
                    ON Excav.Id = [Dump].FieldExcav
                LEFT OUTER JOIN [DBADMINS].[ELLOperational].[std].StdShiftgrade AS Grade WITH (NOLOCK)
                    ON Grade.Id = [Dump].FieldGrade
                LEFT OUTER JOIN [DBADMINS].ELLOperational.std.StdShiftLocations AS Loc WITH (NOLOCK)
                    ON Loc.Id = [Dump].FieldLoc
                LEFT OUTER JOIN [DBADMINS].ELLOperational.std.StdShiftLocations AS Blast WITH (NOLOCK)
                    ON Blast.Id = [Dump].FieldBlast
                LEFT JOIN [DBADMINS].ELLOperational.Common.EnumMaterial AS Material WITH (NOLOCK)
                    ON Material.Id = [Dump].FieldLoad
            WHERE [Dump].shiftid BETWEEN @StartShiftId AND @EndShiftId
        ) AS StdDumps
        LEFT JOIN PITLOC AS StdPitloc WITH (NOLOCK)
        ON StdDumps.[DumpLocation] = StdPitloc.FieldId
        ),

        Grades AS (
        SELECT Grades.Id AS GradeId,
                CASE WHEN Grades.Grade06 = -1 THEN 0
                    ELSE Grades.Grade06
                END AS Grano,
                CASE WHEN Grades.Grade07 = -1 THEN 0
                    ELSE Grades.Grade07
                END AS Porfo,
                CASE WHEN Grades.Grade08 = -1 THEN 0
                    ELSE Grades.Grade08
                END AS Shisti,
                CASE WHEN Grades.Grade02 = -1 THEN 0
                    ELSE Grades.Grade02
                END AS Okisi,
                enum.Description AS MatType,
                ROUND(ISNULL([MaterialDensity], 0), 2) AS [MaterialDensity]
        FROM [DBADMINS].[ELLOperational].[std].StdShiftgrade AS Grades WITH (NOLOCK)
        LEFT JOIN [DBADMINS].[ELLOperational].[dbo].[Enum] AS enum WITH (NOLOCK)
            ON Grades.LoadId = enum.Id
        LEFT JOIN [DBADMINS].[ELLOperational].[DispatchConfiguration].[Material] AS mat WITH (NOLOCK)
            ON (mat.[MaterialEnumTypeId] = enum.EnumTypeId
                AND mat.[MaterialIdx] = enum.Idx
                AND (enum.Description LIKE 'Насипен%' OR enum.Description LIKE 'Стар%Насип%' OR enum.Description LIKE '%Окисен%материал%')
                )
        WHERE LEFT(Grades.Id, 9) BETWEEN @StartShiftId AND @EndShiftId
        ),

        vv AS (
        SELECT ISNULL(StdLoads.TruckId, StdDumps.TruckId) AS TruckId,
            ISNULL(StdLoads.TruckName, StdDumps.TruckName) AS TruckName,
            ISNULL(StdLoads.ExcavId, StdDumps.ExcavId) AS ExcavId,
            ISNULL(StdLoads.GradeId, StdDumps.GradeId) AS GradeId,
            StdLoads.Truck,
            StdLoads.TruckType,
            StdLoads.TruckTypeID,
            StdLoads.Excav,
            StdLoads.ExcavType,
            StdLoads.ShiftId AS ShiftId,
            StdLoads.FullShiftName,
            StdLoads.WorkingYear,
            StdLoads.LoadLocationId,
            StdLoads.LoadLocation,
            StdLoads.Horiz,
            StdLoads.NextShiftDumpId,
            StdLoads.MaterialId AS MaterialId,
            StdLoads.Material AS Material,
            ISNULL(StdDumps.DumpLocationId, 0) AS DumpLocationId,
            StdDumps.DumpLocation,
            StdDumps.DumpLocationUnit,
            StdDumps.DumpHoriz,
            StdDumps.[FieldShoptype],
            IIF(StdDumps.[Shoptype] LIKE '%Вътрешни%', 'Вътрешни', StdLoads.Material) AS [Shoptype],
            FieldLoad
        FROM StdLoads
        FULL OUTER JOIN StdDumps
            ON StdLoads.NextShiftDumpId = StdDumps.DumpId
        WHERE StdDumps.DumpLocationId > 0 and StdLoads.LoadLocationId > 0
        ),

        a AS (
        SELECT vv.TruckId AS TruckId,
            vv.TruckName AS TruckName,
            vv.ExcavId AS ExcavId,
            vv.GradeId AS GradeId,
            vv.Truck,
            vv.TruckType,
            vv.TruckTypeID,
            vv.Excav,
            vv.ExcavType,
            vv.ShiftId AS ShiftId,
            vv.FullShiftName,
            vv.WorkingYear,
            vv.LoadLocationId,
            vv.LoadLocation,
            vv.Horiz,
            vv.NextShiftDumpId,
            vv.MaterialId AS MaterialId,
            vv.Material AS Material,
            vv.DumpLocationId AS DumpLocationId,
            vv.DumpLocation,
            vv.DumpLocationUnit,
            vv.DumpHoriz,
            Grades.Porfo AS Porfo,
            Grades.Grano AS Grano,
            Grades.Shisti AS Shisti,
            CASE WHEN Grades.Grano = 0 AND Grades.Porfo = 0 AND Grades.Shisti = 0 THEN TruckMat.MATERIALDEF
                ELSE 0 END AS NeoprTon,
            CASE WHEN Grades.Grano = 0 AND Grades.Porfo = 0 AND Grades.Shisti = 0 THEN TruckMat.MATERIALDEF / TruckMat.MDP
                ELSE 0 END AS NeoprVol,
            CASE
                WHEN Grades.MatType LIKE N'Окисен%материал%'
                    AND Grades.Okisi > 30 THEN
            (((Grades.MaterialDensity * TruckMat.GRA / TruckMat.GRAP) / TruckMat.TRUCK_SIZE)
            * (Grades.Grano * TruckMat.TRUCK_SIZE / 100)
            )
                WHEN Grades.MatType LIKE N'Медна_руда%'
                    AND Grades.Okisi
                    BETWEEN 10 AND 30 THEN
            (((2.60 * TruckMat.GRA / TruckMat.GRAP) / TruckMat.TRUCK_SIZE) * (Grades.Grano * TruckMat.TRUCK_SIZE / 100))
                ELSE
            ((TruckMat.GRA / TruckMat.TRUCK_SIZE) * (Grades.Grano * TruckMat.TRUCK_SIZE / 100))
            END AS Graton,
            CASE
                WHEN Grades.MatType LIKE N'Окисен%материал%'
                    AND Grades.Okisi > 30 THEN
            (((Grades.MaterialDensity * TruckMat.POR / TruckMat.PORP) / TruckMat.TRUCK_SIZE)
            * (Grades.Porfo * TruckMat.TRUCK_SIZE / 100)
            )
                WHEN Grades.MatType LIKE N'Медна_руда%'
                    AND Grades.Okisi
                    BETWEEN 10 AND 30 THEN
            (((2.60 * TruckMat.POR / TruckMat.PORP) / TruckMat.TRUCK_SIZE) * (Grades.Porfo * TruckMat.TRUCK_SIZE / 100))
                ELSE
            ((TruckMat.POR / TruckMat.TRUCK_SIZE) * (Grades.Porfo * TruckMat.TRUCK_SIZE / 100))
            END AS Porton,
            CASE
                WHEN Grades.MatType LIKE 'Насипен%' THEN
            (((Grades.MaterialDensity * TruckMat.SHI / TruckMat.SHIP) / TruckMat.TRUCK_SIZE)
            * (Grades.Shisti * TruckMat.TRUCK_SIZE / 100)
            )
                WHEN Grades.MatType LIKE 'Стар%Насип%' THEN
            ((((Grades.MaterialDensity * TruckMat.SHI / TruckMat.SHIP) / TruckMat.TRUCK_SIZE)
                * (Grades.Shisti * TruckMat.TRUCK_SIZE / 100)
            ) * 1.24885
            )
                WHEN Grades.MatType LIKE N'Окисен%материал%'
                    AND Grades.Okisi > 30 THEN
            (((Grades.MaterialDensity * TruckMat.SHI / TruckMat.SHIP) / TruckMat.TRUCK_SIZE)
            * (Grades.Shisti * TruckMat.TRUCK_SIZE / 100)
            )
                WHEN Grades.MatType LIKE N'Медна_руда%'
                    AND Grades.Okisi
                    BETWEEN 10 AND 30 THEN
            (((2.60 * TruckMat.SHI / TruckMat.SHIP) / TruckMat.TRUCK_SIZE) * (Grades.Shisti * TruckMat.TRUCK_SIZE / 100))
                ELSE
            ((TruckMat.SHI / TruckMat.TRUCK_SIZE) * (Grades.Shisti * TruckMat.TRUCK_SIZE / 100))
            END AS Shiton,
            (((TruckMat.GRA / TruckMat.TRUCK_SIZE) * (Grades.Grano * TruckMat.TRUCK_SIZE / 100)) / TruckMat.GRAP) AS Gravol,
            (((TruckMat.POR / TruckMat.TRUCK_SIZE) * (Grades.Porfo * TruckMat.TRUCK_SIZE / 100)) / TruckMat.PORP) AS Porvol,
            CASE
                WHEN Grades.MatType LIKE 'Насипен%' THEN
            (((((Grades.MaterialDensity * TruckMat.SHI / TruckMat.SHIP) / TruckMat.TRUCK_SIZE)
                * (Grades.Shisti * TruckMat.TRUCK_SIZE / 100)
                ) / Grades.MaterialDensity
            )
            )
                WHEN Grades.MatType LIKE 'Стар%Насип%' THEN
            ((((((Grades.MaterialDensity * TruckMat.SHI / TruckMat.SHIP) / TruckMat.TRUCK_SIZE)
                * (Grades.Shisti * TruckMat.TRUCK_SIZE / 100)
                ) / Grades.MaterialDensity
                )
            ) * 1.24885
            )
                ELSE
            (((TruckMat.SHI / TruckMat.TRUCK_SIZE) * (Grades.Shisti * TruckMat.TRUCK_SIZE / 100)) / TruckMat.SHIP)
            END AS Shivol,
            vv.[FieldShoptype],
            vv.[Shoptype],
            FieldLoad,
            MaterialDensity
        FROM vv
        INNER JOIN Grades ON Grades.GradeId = vv.GradeId
        LEFT JOIN (
            SELECT TruckMat.TRUCK,
                    TruckMat.[WYear],
                    TruckMat.TRUCK_SIZE,
                    TruckMat.GRA,
                    TruckMat.GRAP,
                    TruckMat.POR,
                    TruckMat.PORP,
                    TruckMat.SHI,
                    TruckMat.SHIP,
                    TruckMat.MDP,
                    TruckMat.MATERIALDEF
            FROM TRUCK_MAT AS TruckMat WITH (NOLOCK)
        ) TruckMat
        ON TruckMat.TRUCK = vv.TruckName AND vv.WorkingYear = TruckMat.[WYear]
        ),

        rr AS (
        SELECT a.ShiftId AS ShiftId,
            a.FullShiftName,
            a.WorkingYear,
            a.ExcavId AS ExcavId,
            a.LoadLocationId AS LoadLocationId,
            a.LoadLocation AS LoadLocation,
            a.Horiz,
            a.DumpLocationId AS DumpLocationId,
            a.DumpLocation,
            a.DumpLocationUnit,
            a.DumpHoriz,
            a.TruckId AS TruckId,
            a.Truck,
            a.TruckType,
            a.TruckTypeID,
            a.Excav,
            a.ExcavType,
            a.MaterialId AS MaterialId,
            a.Material AS Material,
            COUNT(*) AS Br,
            SUM(a.Graton + a.Porton + a.Shiton + a.NeoprTon) AS Ton,
            SUM(a.Gravol + a.Porvol + a.Shivol + a.NeoprVol) AS Vol,
            a.[FieldShoptype],
            a.[Shoptype],
            a.[FieldLoad],
            a.[MaterialDensity]
        FROM a
        GROUP BY a.ShiftId,
            a.FullShiftName,
            a.WorkingYear,
            a.MaterialId,
            a.Material,
            a.ExcavId,
            a.LoadLocationId,
            a.LoadLocation,
            a.DumpLocationId,
            a.Horiz,
            a.DumpLocation,
            a.DumpLocationUnit,
            a.DumpHoriz,
            a.Truck,
            a.Excav,
            a.TruckId,
            a.[FieldShoptype],
            a.[Shoptype],
            a.FieldLoad,
            a.MaterialDensity,
            a.TruckType,
            a.ExcavType,
            a.TruckTypeID
        ),

        hhh AS (
        SELECT CAST(rr.ShiftId AS BIGINT) AS ShiftId,
            rr.FullShiftName,
            rr.WorkingYear,
            rr.MaterialId,
            rr.Material,
            rr.LoadLocationId,
            rr.LoadLocation,
            rr.Horiz,
            rr.DumpHoriz,
            rr.DumpLocationId,
            rr.DumpLocation,
            rr.DumpLocationUnit,
            rr.Truck,
            rr.TruckType,
            rr.TruckTypeID,
            rr.Excav,
            rr.ExcavType,
            rr.Br,
            CASE WHEN rr.Material = 'Части' THEN 0
                ELSE rr.Ton
            END AS Ton,
            CASE WHEN rr.Material = 'Части' THEN 0
                ELSE rr.Vol
            END AS Vol,
            rr.[FieldShoptype],
            CASE WHEN (rr.DumpLocation = 'ДЕПО_РУДА') THEN 'Руда на депо'
                WHEN (rr.DumpLocation = 'ДЕПО_РУДА1') THEN 'Руда на депо'
                WHEN (rr.DumpLocation = 'ДЕПО_РУДА3') AND (rr.Material IN ( N'Медна_руда' )) THEN N'Вътрешни'
                WHEN (rr.LoadLocation = 'ДЕПО_РУДА') AND (rr.DumpLocation IN ( 'KET-1', 'KET-3' )) THEN 'Руда от депо'
                WHEN (rr.LoadLocation = 'ДЕПО_РУДА1') AND (rr.DumpLocation IN ( 'KET-1', 'KET-3' )) THEN 'Руда от депо'
                WHEN (rr.LoadLocation LIKE '051-910-%P') AND (rr.DumpLocation IN ( 'KET-1', 'KET-3' )) THEN 'Руда от депо'
                WHEN (rr.LoadLocation = 'ДЕПО_РУДА3') AND (rr.DumpLocation IN ( 'KET-1', 'KET-3' )) THEN 'Руда от депо'
                WHEN (rr.LoadLocation = 'ДЕПО_ИБР') AND (rr.DumpLocation IN ( 'KET-1', 'KET-3' )) THEN 'ИБР от депо'
                WHEN (rr.DumpLocation = 'ДЕПО_ИБР') AND (rr.Material IN ( 'ИБР', 'Откривка' )) THEN N'ИБР на депо' 
                WHEN (rr.DumpLocation LIKE '%РУДЕН%ПРОСИП') THEN N'НА РУДЕН ПРОСИП'
                WHEN (rr.LoadLocation LIKE '%РУДЕН%ПРОСИП%' AND (rr.DumpLocation IN ( 'KET-1', 'KET-3' ))) THEN N'Руда от ПРОСИП'
                ELSE rr.[Shoptype]
            END AS Shoptype,
            rr.[FieldLoad],
            rr.[MaterialDensity]
        FROM rr
        )

        SELECT 
            CAST(hhh.ShiftId AS BIGINT) AS Shiftid,
            hhh.WorkingYear,
            hhh.FullShiftName,
            hhh.MaterialId,
            hhh.Material,
            hhh.LoadLocationId,
            hhh.LoadLocation,
            hhh.Horiz,
            hhh.DumpHoriz,
            hhh.DumpLocationId,
            hhh.DumpLocation,
            hhh.DumpLocationUnit AS DumpLocationUnit,
            hhh.Truck,
            hhh.TruckType,
            NULL AS TruckObjectNew,
            NULL AS TruckObject,
            hhh.Excav,
            NULL AS ExcavObject,
            NULL AS ExcavObjectNew,
            hhh.ExcavType,
            NULL AS TruckOperId,
            NULL AS TruckOperatorName,
            hhh.Br,
            hhh.Ton,
            hhh.Vol,
            NULL AS avgDumpDist,
            NULL AS EndTotalDist,
            0.0 AS Tonkm,
            NULL AS TonkmReal,
            NULL AS EndTotalDistRP,
            NULL AS DumpTotalDist,
            NULL AS RealTotalDist,
            NULL AS LoadTotalDist,
            hhh.FieldShoptype,
            CASE WHEN (hhh.Shoptype LIKE 'Руда на депо%' OR hhh.Shoptype LIKE '%РУДЕН%ПРОСИП%') AND (hhh.MaterialId = 271) THEN 'Вътрешни'
                ELSE hhh.Shoptype
            END AS ShopType,
            NULL AS G_on_ELL,
            hhh.FieldLoad,
            hhh.MaterialDensity,
            NULL AS density,
            NULL AS Cu,
            NULL AS MetalTon,
            NULL AS sssRP,
            NULL AS DistTRZint,
            hhh.TruckTypeID
        FROM hhh

        ;with daily_aggregates as (
        SELECT
            Shiftid,
            Material,
            SUM(Br) AS Br,
            SUM(Vol) AS Vol,
            SUM(Tonkm) AS Tonkm,
            SUM(Ton) AS Tons
        FROM @MarkTable
        where LoadLocationId > 0
            and DumpLocationId > 0
            and Material <> N'Части'
        GROUP BY Shiftid, Material
        ),
        totals_with_date as (
            select 
                Shiftid,
                CAST(LEFT(Shiftid, 6) as date) as ShiftDate,
                SUM(CASE WHEN Material = N'Руда' THEN Br ELSE 0 END) as Br_Ore,
                SUM(CASE WHEN Material = N'Руда' THEN Vol ELSE 0 END) Vol_Ore,
                SUM(CASE WHEN Material = N'Руда' THEN Tonkm ELSE 0 END) Tonkm_Ore,
                SUM(CASE WHEN Material = N'Руда' THEN Tons ELSE 0 END) Tons_Ore,

                SUM(CASE WHEN Material = N'Откривка' THEN Br ELSE 0 END) as Br_Waste,
                SUM(CASE WHEN Material = N'Откривка' THEN Vol ELSE 0 END) Vol_Waste,
                SUM(CASE WHEN Material = N'Откривка' THEN Tonkm ELSE 0 END) Tonkm_Waste,
                SUM(CASE WHEN Material = N'Откривка' THEN Tons ELSE 0 END) Tons_Waste
            from daily_aggregates
            group by Shiftid
        )
        SELECT 
            Shiftid as ShiftId,
            Br_Ore,	Br_Waste,
            Vol_Ore, Vol_Waste,
            Tons_Ore, Tons_Waste,
            Tonkm_Ore, Tonkm_Waste,
            totals_with_date.Br_Ore + totals_with_date.Br_Waste as Br_Total,
            totals_with_date.Tons_Ore + totals_with_date.Tons_Waste as Tons_Total,
            totals_with_date.Vol_Ore + totals_with_date.Vol_Waste as Vol_Total,
            totals_with_date.Tonkm_Ore + totals_with_date.Tonkm_Waste as Tonkm_Total,
            MesechePlan.PlanVolOreKet,
            MesechePlan.PlanmassOreKet,
            MesechePlan.PlanVolWaste,
            MesechePlan.PlanMassWaste
        from totals_with_date
        LEFT JOIN [ELLDBAdmins].[dbo].[MesechePlan] MesechePlan WITH (NOLOCK)
            on totals_with_date.ShiftDate = MesechePlan.[PlanMonthDay]
        ORDER BY ShiftId`,
      { StartShiftId, EndShiftId },
      "moddb2",
    );
    // #region agent log
    const sqlQueryEndTime = Date.now();
    try {
      appendFileSync(
        logPath,
        JSON.stringify({
          location: "production.repository.ts:175",
          message: "sqlQuery completed successfully",
          data: {
            sqlQueryDuration: sqlQueryEndTime - sqlQueryStartTime,
            totalDuration: sqlQueryEndTime - queryStartTime,
            sqlQueryEndTime,
            isTimeout: false,
          },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "A,B,C,D,E",
        }) + "\n",
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {}
    // #endregion
  } catch (error) {
    // #region agent log
    const errorTime = Date.now();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isTimeoutError =
      errorMessage.toLowerCase().includes("timeout") ||
      errorMessage.toLowerCase().includes("timed out") ||
      errorMessage.toLowerCase().includes("request timeout") ||
      errorMessage.toLowerCase().includes("query timeout");
    try {
      appendFileSync(
        logPath,
        JSON.stringify({
          location: "production.repository.ts:198",
          message: "getCurrentProduction sqlQuery error",
          data: {
            errorMessage,
            errorStack: error instanceof Error ? error.stack : "N/A",
            errorType: error?.constructor?.name ?? typeof error,
            sqlQueryDuration: errorTime - sqlQueryStartTime,
            totalDuration: errorTime - queryStartTime,
            isTimeout: isTimeoutError,
            timeoutThreshold: 60000,
            exceededTimeout: errorTime - sqlQueryStartTime > 60000,
            errorTime,
          },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "A,B,C,D,E",
        }) + "\n",
      );
    } catch (e) {}
    // #endregion
    throw error;
  }

  // #region agent log
  const functionEndTime = Date.now();
  try {
    appendFileSync(
      logPath,
      JSON.stringify({
        location: "production.repository.ts:230",
        message: "getCurrentProduction result",
        data: {
          resultType: typeof result,
          isArray: Array.isArray(result),
          length: Array.isArray(result) ? result.length : "N/A",
          firstItem:
            Array.isArray(result) && result.length > 0
              ? Object.keys(result[0] ?? {})
              : "N/A",
          sample:
            Array.isArray(result) && result.length > 0
              ? JSON.stringify(result[0])
              : "N/A",
          totalFunctionDuration: functionEndTime - queryStartTime,
          functionEndTime,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A,B,C,D,E",
      }) + "\n",
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {}
  // #endregion

  return result;
}

export async function getWeeklyProduction(
  StartShiftId: number,
  EndShiftId: number,
): Promise<
  {
    Shiftid: number;
    Br_Ore: number;
    Br_Waste: number;
    Vol_Ore: number;
    Vol_Waste: number;
    Tons_Ore: number;
    Tons_Waste: number;
    Tonkm_Ore: number;
    Tonkm_Waste: number;
    Br_Total: number;
    Tons_Total: number;
    Vol_Total: number;
    Tonkm_Total: number;
  }[]
> {
  return sqlQuery<{
    Shiftid: number;
    Br_Ore: number;
    Br_Waste: number;
    Vol_Ore: number;
    Vol_Waste: number;
    Tons_Ore: number;
    Tons_Waste: number;
    Tonkm_Ore: number;
    Tonkm_Waste: number;
    Br_Total: number;
    Tons_Total: number;
    Vol_Total: number;
    Tonkm_Total: number;
  }>(
    `
        declare @YearMonth int
        declare @StartShift int
        declare @EndShift int
        declare @ShiftsDate date

        declare @MarkTable table
        (
            Shiftid bigint null,
            WorkingYear int null,
            FullShiftName nvarchar(50) null,
            [MaterialId] bigint null,
            [Material] nvarchar(30) null,
            LoadLocationId bigint null,
            LoadLocation nvarchar(30) null,
            Horiz float NULL,
            DumpHoriz float NULL,
            DumpLocationId bigint NULL,
            DumpLocation nvarchar(50) null,
            DumpLocationUnit nvarchar(50) NULL,
            Truck nvarchar(50) NULL,
            TruckType nvarchar(50) NULL,
            TruckObjectNew int NULL,
            TruckObject nvarchar(50) NULL,
            Excav nvarchar(10) NULL,
            ExcavObject int NULL,
            ExcavObjectNew nvarchar(30) NULL,
            ExcavType nvarchar(50) NULL,
            TruckOperId nvarchar(30) NULL,
            TruckOperatorName nvarchar(100) NULL,
            Br int NULL,
            Ton float NULL,
            Vol float NULL,
            [avgDumpDist] float NULL,
            [EndTotalDist] float NULL,
            [Tonkm] float NULL,
            [TonkmReal] float NULL,
            [EndTotalDistRP] float NULL,
            [DumpTotalDist] float NULL,
            [RealTotalDist] float NULL,
            [LoadTotalDist] float NULL,
            [FieldShoptype] nvarchar(30) NULL,
            ShopType nvarchar(50) NULL,
            G_on_ELL int NULL,
            [FieldLoad] int NULL,
            [MaterialDensity] float NULL,
            density float NULL,
            Cu float NULL,
            MetalTon float NULL,
            sssRP int NULL,
            DistTRZint int NULL,
            TruckTypeID int NULL
        )

        -- Select start/end shift
        declare @currentDate date  = cast(getdate() as date);

        select @EndShift = max(shiftid),
            @YearMonth = left(max(shiftid), 4),
            @ShiftsDate = cast(left(max(shiftid), 6) as date)
        from [ISMP_SP_FUNCTION].[dbo].ShiftList()
        where ShiftStartDate = @currentDate
        --from  ELLOperational.Common.ShiftInfo where ShiftStartDate = dateadd(DAY,-2,cast(getdate() as date)) --EndShift

        select @StartShift = min(Shiftid)
        from [ISMP_SP_FUNCTION].[dbo].ShiftList()
        where left(shiftid, 4) = @YearMonth

        --select @StartShift, @EndShift, @ShiftsDate, @YearMonth


        IF OBJECT_ID('tempdb..#marksh', 'U') IS NOT NULL
            drop table #marksh
        IF OBJECT_ID('tempdb..#daily_aggregates', 'U') IS NOT NULL
            DROP TABLE #daily_aggregates;


        ------- Function MARCSHAIDER
        insert into @MarkTable
        select *
        from ISMP_SP_FUNCTION.[dbo].[Function_Marckshaideri](@StartShift, @EndShift)

        select @ShiftsDate as Shiftday,
            left(cast((ShiftId) as int), 4) as YearMonth,
            left(cast((ShiftId) as int), 6) as YearMonthDay,
            *,
            case when CHARINDEX(N'-', LoadLocation) > 0 -- LoadLocation like N'%-%-%'
                    then SUBSTRING(LoadLocation, CHARINDEX(N'-', LoadLocation) + 1,  -- Start just after the first slash
                    CHARINDEX(N'-', LoadLocation, CHARINDEX(N'-', LoadLocation) + 1)  - CHARINDEX(N'-', LoadLocation) - 1)  --Position of second slash Minus position of first slash 
                    else LoadLocation 
            end as HorizBlastOld
        into #marksh
        from @MarkTable
        where LoadLocationId > 0
            and DumpLocationId > 0
            and Material <> N'Части'
        --select * from #marksh
        -------END Function MARCSHAIDER

        delete from @MarkTable
        CREATE CLUSTERED INDEX IX_marksh_ShiftId ON #marksh (Shiftid, Material);


        SELECT
            Shiftid,
            Material,
            SUM(Br) AS Br,
            SUM(Vol) AS Vol,
            SUM(Tonkm) AS Tonkm,
            SUM(Ton) AS Tons
        INTO #daily_aggregates
        FROM #marksh
        GROUP BY Shiftid, Material;

        SELECT Shiftid,
            Br_Ore,	Br_Waste,
            Vol_Ore, Vol_Waste,
            Tons_Ore, Tons_Waste,
            Tonkm_Ore, Tonkm_Waste,
            totals_current.Br_Ore + totals_current.Br_Waste as Br_Total,
            totals_current.Tons_Ore + totals_current.Tons_Waste as Tons_Total,
            totals_current.Vol_Ore + totals_current.Vol_Waste as Vol_Total,
            totals_current.Tonkm_Ore + totals_current.Tonkm_Waste as Tonkm_Total
        from (
            select 
                Shiftid,
                SUM(CASE WHEN Material = N'Руда' THEN Br ELSE 0 END) as Br_Ore,
                SUM(CASE WHEN Material = N'Руда' THEN Vol ELSE 0 END) Vol_Ore,
                SUM(CASE WHEN Material = N'Руда' THEN Tonkm ELSE 0 END) Tonkm_Ore,
                SUM(CASE WHEN Material = N'Руда' THEN Tons ELSE 0 END) Tons_Ore,

                SUM(CASE WHEN Material = N'Откривка' THEN Br ELSE 0 END) as Br_Waste,
                SUM(CASE WHEN Material = N'Откривка' THEN Vol ELSE 0 END) Vol_Waste,
                SUM(CASE WHEN Material = N'Откривка' THEN Tonkm ELSE 0 END) Tonkm_Waste,
                SUM(CASE WHEN Material = N'Откривка' THEN Tons ELSE 0 END) Tons_Waste
            from #daily_aggregates
            --where ShiftId like FORMAT(@ShiftsDate, 'yyMMdd') + '%'
            group by Shiftid
        ) totals_current

        IF OBJECT_ID('tempdb..#marksh', 'U') IS NOT NULL
            drop table #marksh
        IF OBJECT_ID('tempdb..#daily_aggregates', 'U') IS NOT NULL
            DROP TABLE #daily_aggregates;
      `,
    {
      StartShiftId,
      EndShiftId,
    },
    "moddb2",
  );
}
