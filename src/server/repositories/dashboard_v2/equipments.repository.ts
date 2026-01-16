import { sqlQuery } from "@/server/database/db";

/**
 * Get the average cycle/spot/queue time for truck.
 * The double avg is for more accurate results from the shift paths.
 */
export async function getEquipmentUtilisation(
  StartShiftId: number,
  EndShiftId: number,
): Promise<
  {
    EquipmentGroup: string;
    SumProductiveTimeSec: number;
    SumAvaliableTimeSec: number;
    SumIdleTimeSec: number;
    TotalTimeSec: number;
    Utilization: number;
    Availability: number;
  }[]
> {
  return sqlQuery<{
    EquipmentGroup: string;
    SumProductiveTimeSec: number;
    SumAvaliableTimeSec: number;
    SumIdleTimeSec: number;
    TotalTimeSec: number;
    Utilization: number;
    Availability: number;
  }>(
    `;with CTE_TimeZone as (
        SELECT CONVERT(VARCHAR(100), [Value]) AS TimeZone
        FROM     ELLOperational.ApplicationConfiguration.Configuration
        WHERE  [KEY] = 'CLIENT_TIME_ZONE'
        ),
        status_eqmt as (
        SELECT Shiftstate.Id,
            Shiftstate.ShiftId,	   
            datediff(second, '1970-01-01', CONVERT(datetime, dateadd(SECOND, ShiftInfo.ShiftStartTimestampUtc + Shiftstate.FieldTime, '1970-01-01') AT TIME ZONE 'UTC' AT TIME ZONE CTE.TimeZone)) AS [Timestamp],
    
            ShiftInfo.ShiftDuration,
            ShiftInfo.ShiftStartDateTime,
            Shiftstate.FieldId,
            SUMShiftStatus.Duration AS Duration,
            ShiftInfo.ShiftStartDateTime + Shiftstate.FieldId as StartTime,
            DATEADD(SECOND, SUMShiftStatus.Duration, ShiftInfo.ShiftStartDateTime + Shiftstate.FieldId) AS EndTime,
            DATEADD(SECOND, ShiftInfo.ShiftDuration, ShiftInfo.ShiftStartDateTime) as ShiftEndDateTime,
        
            ISNULL(Shiftstate.FieldEqmt, Shiftstate.FieldAuxeqmt) as FieldEqmt,
            ISNULL(Shiftstate.Eqmt, Shiftstate.Auxeqmt) as Eqmt,
            Shiftstate.FieldTime,
            Shiftstate.FieldReason,
            Shiftstate.Reason,
            Shiftstate.StatusId,
            [Status].[Idx] AS [StatusIdx],
            [Status].Description AS [Status]
        FROM (
            SELECT st.Id,
                st.FieldId,
                eq.ShiftId,
                eq.Id FieldEqmt,
                eq.FieldId Eqmt,
                NULL FieldAuxeqmt,
                NULL Auxeqmt,
                st.FieldTime,
                ISNULL(r.FieldReason, st.FieldReason) FieldReason,
                r.FieldName Reason,
                r.FieldCategory TimecatId,
                ISNULL(r.FieldStatus, st.FieldStatus) StatusId,
                st.FieldComment,
                eq.FieldIsauxil IsAuxil
            FROM ELLOperational.[dbo].SHIFTShifteqmt eq WITH (nolock)
                INNER JOIN ELLOperational.[dbo].SHIFTShiftstate st WITH (nolock)
                    ON st.ShiftId = eq.ShiftId
                    AND st.FieldEqmt = eq.Id
                    AND st.FieldComment != 'Artificial shiftchange event'
                LEFT JOIN ELLOperational.[dbo].SHIFTShiftreason r WITH (nolock)
                    ON st.FieldReasonrec = r.Id
            WHERE eq.ShiftId between @StartShiftId and @EndShiftId
        
            UNION ALL
            SELECT eq.Id,
                '00:00:00' FieldId,
                eq.ShiftId,
                eq.Id FieldEqmt,
                eq.FieldId Eqmt,
                NULL FieldAuxeqmt,
                NULL Auxeqmt,
                0 FieldTime,
                eq.FieldReason FieldReason,
                r.FieldName Reason,
                r.FieldCategory TimecatId,
                eq.FieldStatus StatusId,
                eq.FieldComment,
                eq.FieldIsauxil IsAuxil
            FROM ELLOperational.[dbo].SHIFTShifteqmt eq WITH (nolock)
                LEFT JOIN ELLOperational.[dbo].SHIFTShiftreason r WITH (nolock)
                    ON eq.FieldReasonrec = r.Id
            WHERE eq.ShiftId between @StartShiftId and @EndShiftId
        
            UNION ALL
            SELECT st.Id,
                st.FieldId,
                eq.ShiftId,
                NULL,
                NULL,
                eq.Id,
                eq.FieldId,
                st.FieldTime,
                ISNULL(r.FieldReason, st.FieldReason) FieldReason,
                r.FieldName,
                r.FieldCategory,
                ISNULL(r.FieldStatus, st.FieldStatus),
                st.FieldComment,
                1
            FROM ELLOperational.[dbo].SHIFTShiftaux eq WITH (nolock)
                INNER JOIN ELLOperational.[dbo].SHIFTShiftstate st WITH (nolock)
                    ON st.ShiftId = eq.ShiftId
                    AND st.FieldAuxeqmt = eq.Id
                    AND st.FieldComment != 'Artificial shiftchange event'
                LEFT JOIN ELLOperational.[dbo].SHIFTShiftreason r WITH (nolock)
                    ON st.FieldReasonrec = r.Id
            WHERE eq.ShiftId between @StartShiftId and @EndShiftId
            
            UNION ALL
            SELECT eq.Id,
                '00:00:00',
                eq.ShiftId,
                NULL,
                NULL,
                eq.Id,
                eq.FieldId,
                0 FieldTime,
                ISNULL(r.FieldReason, eq.FieldReason) FieldReason,
                r.FieldName,
                r.FieldCategory,
                ISNULL(r.FieldStatus, eq.FieldStatus),
                eq.FieldComment,
                1
            FROM ELLOperational.[dbo].SHIFTShiftaux eq WITH (nolock)
                LEFT JOIN ELLOperational.[dbo].SHIFTShiftreason r WITH (nolock)
                    ON eq.FieldReasonrec = r.Id
            WHERE eq.ShiftId between @StartShiftId and @EndShiftId
        
        ) Shiftstate
        INNER JOIN ELLOperational.Common.ShiftInfo ShiftInfo WITH (nolock)
            ON ShiftInfo.ShiftId = Shiftstate.ShiftId
        LEFT OUTER JOIN ELLOperational.NGD4Summary.SUMShiftStatus SUMShiftStatus WITH (nolock)
            ON Shiftstate.Id = SUMShiftStatus.Id
        INNER JOIN ELLOperational.[dbo].Enum [Status] WITH (nolock)
            ON [Status].Id = [Shiftstate].StatusId
        CROSS JOIN CTE_TimeZone CTE
        )
        --216	1	СВАЛЕН ОТ УПОТРЕБА
        --217	2	Готовност
        --218	3	Изчакване
        --219	4	Закъснение
        select ShiftId, 
            Eqmt,
            CASE 
                WHEN Eqmt LIKE '2C%' THEN 'Trucks'
                WHEN Eqmt LIKE '2B%' OR Eqmt LIKE '2L%' THEN 'Shovels'
                WHEN Eqmt LIKE '2S%' THEN 'Drills'
                ELSE 'Aux'
            END as EquipmentGroup,
            Sum(CASE WHEN StatusId = 217 THEN Duration ELSE 0 END) as SumProductiveTimeSec,
            Sum(CASE WHEN StatusId in (217, 218) THEN Duration ELSE 0 END) as SumAvaliableTimeSec,
            Sum(CASE WHEN StatusId in (216, 219) THEN Duration ELSE 0 END) as SumIdleTimeSec,
            Sum(ShiftDuration) as TotalTimeSec
        from status_eqmt s
        WHERE Eqmt NOT IN (N'2W999', N'2S98', N'2C999', N'2B998', N'2BРЦ')
        group by ShiftId, Eqmt`,
    { StartShiftId, EndShiftId },
    "moddb",
  );
}
