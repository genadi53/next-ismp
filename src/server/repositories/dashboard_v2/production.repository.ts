import { sqlQuery } from "@/server/database/db";

/**
 * Get the current production data for the given shift range.
 */
export async function getCurrentProduction(
  StartShiftId: number,
  EndShiftId: number,
): Promise<
  {
    Br_Ore: number;
    Tons_Ore: number;
    Vol_Ore: number;
    Tonkm_Ore: number;
    Br_Waste: number;
    Vol_Waste: number;
    Tons_Waste: number;
    Tonkm_Waste: number;
    StrippingRatio: number;
    Br_Total: number;
    Tons_Total: number;
    Vol_Total: number;
    Tonkm_Total: number;
    Br_Ore_Prev: number;
    Tons_Ore_Prev: number;
    Vol_Ore_Prev: number;
    Tonkm_Ore_Prev: number;
    Br_Waste_Prev: number;
    Vol_Waste_Prev: number;
    Tons_Waste_Prev: number;
    Tonkm_Waste_Prev: number;
    StrippingRatio_Prev: number;
    Br_Total_Prev: number;
    Tons_Total_Prev: number;
    Vol_Total_Prev: number;
    Tonkm_Total_Prev: number;
  }[]
> {
  return sqlQuery<{
    Br_Ore: number;
    Tons_Ore: number;
    Vol_Ore: number;
    Tonkm_Ore: number;
    Br_Waste: number;
    Vol_Waste: number;
    Tons_Waste: number;
    Tonkm_Waste: number;
    StrippingRatio: number;
    Br_Total: number;
    Tons_Total: number;
    Vol_Total: number;
    Tonkm_Total: number;
    Br_Ore_Prev: number;
    Tons_Ore_Prev: number;
    Vol_Ore_Prev: number;
    Tonkm_Ore_Prev: number;
    Br_Waste_Prev: number;
    Vol_Waste_Prev: number;
    Tons_Waste_Prev: number;
    Tonkm_Waste_Prev: number;
    StrippingRatio_Prev: number;
    Br_Total_Prev: number;
    Tons_Total_Prev: number;
    Vol_Total_Prev: number;
    Tonkm_Total_Prev: number;
  }>(
    `   declare @YearMonth int
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

        select 
            totals_current.Br_Ore,
            totals_current.Tons_Ore,
            totals_current.Vol_Ore,
            totals_current.Tonkm_Ore,
            totals_current.Br_Waste,
            totals_current.Vol_Waste,
            totals_current.Tons_Waste,
            totals_current.Tonkm_Waste,
            CASE WHEN totals_current.Vol_Ore > 0 THEN (totals_current.Vol_Waste / totals_current.Vol_Ore) ELSE (totals_current.Vol_Waste / 1) END as StrippingRatio,
            totals_current.Br_Ore + totals_current.Br_Waste as Br_Total,
            totals_current.Tons_Ore + totals_current.Tons_Waste as Tons_Total,
            totals_current.Vol_Ore + totals_current.Vol_Waste as Vol_Total,
            totals_current.Tonkm_Ore + totals_current.Tonkm_Waste as Tonkm_Total,
            prev_day.*
        from (
        select 
            SUM(CASE WHEN Material = N'Руда' THEN Br ELSE 0 END) as Br_Ore,
            SUM(CASE WHEN Material = N'Руда' THEN Vol ELSE 0 END) Vol_Ore,
            SUM(CASE WHEN Material = N'Руда' THEN Tonkm ELSE 0 END) Tonkm_Ore,
            SUM(CASE WHEN Material = N'Руда' THEN Tons ELSE 0 END) Tons_Ore,

            SUM(CASE WHEN Material = N'Откривка' THEN Br ELSE 0 END) as Br_Waste,
            SUM(CASE WHEN Material = N'Откривка' THEN Vol ELSE 0 END) Vol_Waste,
            SUM(CASE WHEN Material = N'Откривка' THEN Tonkm ELSE 0 END) Tonkm_Waste,
            SUM(CASE WHEN Material = N'Откривка' THEN Tons ELSE 0 END) Tons_Waste
        from #daily_aggregates
        where ShiftId like FORMAT(@ShiftsDate, 'yyMMdd') + '%'
        ) totals_current

        OUTER APPLY (
            select Br_Ore as Br_Ore_Prev,
                Tons_Ore as Tons_Ore_Prev,
                Vol_Ore as Vol_Ore_Prev,
                Tonkm_Ore as Tonkm_Ore_Prev,
                Br_Waste as Br_Waste_Prev,
                Vol_Waste as Vol_Waste_Prev,
                Tons_Waste as Tons_Waste_Prev,
                Tonkm_Waste as Tonkm_Waste_Prev,
                CASE WHEN Vol_Ore > 0 THEN (Vol_Waste / Vol_Ore) ELSE (Vol_Waste / 1) END as StrippingRatio_Prev,
                Br_Ore + Br_Waste as Br_Total_Prev,
                Tons_Ore + Tons_Waste as Tons_Total_Prev,
                Vol_Ore + Vol_Waste as Vol_Total_Prev,
                Tonkm_Ore + Tonkm_Waste as Tonkm_Total_Prev
            from (
                select 
                    SUM(CASE WHEN Material = N'Руда' THEN Br ELSE 0 END) as Br_Ore,
                    SUM(CASE WHEN Material = N'Руда' THEN Vol ELSE 0 END) Vol_Ore,
                    SUM(CASE WHEN Material = N'Руда' THEN Tonkm ELSE 0 END) Tonkm_Ore,
                    SUM(CASE WHEN Material = N'Руда' THEN Tons ELSE 0 END) Tons_Ore,

                    SUM(CASE WHEN Material = N'Откривка' THEN Br ELSE 0 END) as Br_Waste,
                    SUM(CASE WHEN Material = N'Откривка' THEN Vol ELSE 0 END) Vol_Waste,
                    SUM(CASE WHEN Material = N'Откривка' THEN Tonkm ELSE 0 END) Tonkm_Waste,
                    SUM(CASE WHEN Material = N'Откривка' THEN Tons ELSE 0 END) Tons_Waste
                from #daily_aggregates
                where ShiftId like FORMAT(DATEADD(DAY, -1, @ShiftsDate), 'yyMMdd') + '%'
            ) totals_prev_day
        ) prev_day

        IF OBJECT_ID('tempdb..#marksh', 'U') IS NOT NULL
            drop table #marksh
        IF OBJECT_ID('tempdb..#daily_aggregates', 'U') IS NOT NULL
            DROP TABLE #daily_aggregates;
`,
    { StartShiftId, EndShiftId },
    "moddb2",
  );
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
