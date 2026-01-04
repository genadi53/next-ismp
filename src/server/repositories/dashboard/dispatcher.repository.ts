import { sqlQuery } from "@/server/database/db";
import type {
  CurrentDispatcher,
  DispatchEquipmentName,
} from "./types.dispatcher";

/**
 * Get the current dispatcher information.
 */
export async function getCurrentDispatcher(): Promise<CurrentDispatcher[]> {
  return sqlQuery<CurrentDispatcher>(`
    ;WITH Dispatchers AS (
      SELECT DISTINCT [Name], [LoginName]
      FROM [ELLDBAdmins].[dbo].[DispatchersGrafic]
      WHERE LoginName IS NOT NULL
    )
    SELECT TOP 1
           [UserName],
           DATEADD(HH, DATEDIFF(HH, GETUTCDATE(), GETDATE()), [EventTime]) AS localEvent,
           dspAppEvents.[DispatcherProfile],
           [Name],
           [PrimaryDispatcher],
           dspDay,
           CASE
             WHEN CAST(DATEADD(HH, DATEDIFF(HH, GETUTCDATE(), GETDATE()), [EventTime]) AS TIME) BETWEEN '06:30' AND '19:29' THEN 1
             WHEN CAST(DATEADD(HH, DATEDIFF(HH, GETUTCDATE(), GETDATE()), [EventTime]) AS TIME) BETWEEN '19:30' AND '23:59' THEN 2
             WHEN CAST(DATEADD(HH, DATEDIFF(HH, GETUTCDATE(), GETDATE()), [EventTime]) AS TIME) BETWEEN '00:00' AND '06:29' THEN 2
             ELSE 3
           END AS dspShift
    FROM [DBADMINS].[ELLOperational].[DispatchUserLog].[ApplicationSessionEvent] AS dspAppEvents
    INNER JOIN (
      SELECT MAX(id) AS minId,
             dspDay,
             DispatcherProfile
      FROM (
        SELECT [Id],
               [UserName],
               FORMAT(DATEADD(HH, DATEDIFF(HH, GETUTCDATE(), GETDATE()), [EventTime]), 'yyMMd') AS dspDay,
               [DispatcherProfile]
        FROM [DBADMINS].[ELLOperational].[DispatchUserLog].[ApplicationSessionEvent]
        WHERE DispatcherProfile IS NOT NULL
          AND PrimaryDispatcher = 1
      ) AS dspLog
      GROUP BY dspDay, DispatcherProfile
    ) AS dspshDay ON dspshDay.minId = dspAppEvents.id
    INNER JOIN Dispatchers ON Dispatchers.LoginName = dspAppEvents.[DispatcherProfile]
    WHERE dspAppEvents.DispatcherProfile IS NOT NULL
      AND PrimaryDispatcher = 1
      AND UserName NOT LIKE '%mms.service%'
    ORDER BY EventTime DESC
  `);
}

/**
 * Get all equipment names for dispatch selection.
 */
export async function getDispatchEquipmentNames(): Promise<
  DispatchEquipmentName[]
> {
  const results = await sqlQuery<{ FieldId: string }>(`
    SELECT * FROM [ISMP_SP_FUNCTION].[dbo].AllEquipment() 
    WHERE fieldId NOT IN (N'2B998', N'2BРЦ', N'2S98', N'2W999', N'2C999', N'2BРЦ') 
    ORDER BY FieldId
  `);
  return results.map((r) => r.FieldId);
}
