import { sqlQuery } from "@/server/database/db";
import type { NetworkLog } from "./types.logs";

/**
 * Get all network action logs.
 */
export async function getNetworkLogs(): Promise<NetworkLog[]> {
  return sqlQuery<NetworkLog>(`
    SELECT nal.[ID],
           [TimeStamp],
           [NetEqmtID],
           neqmt.[Name],
           neqmt.Brand,
           neqmt.Model,
           neqmt.[Type],
           [NetEqmtActionID],
           neact.[Action],
           [Username],
           [Note]
    FROM [ISMP].[net].[NetActionsLog] AS nal
    LEFT JOIN [ISMP].[net].[NetworkEquipment] AS neqmt ON nal.NetEqmtID = neqmt.ID
    LEFT JOIN [ISMP].[net].[NetEqmtActions] AS neact ON nal.NetEqmtActionID = neact.ID
    ORDER BY nal.[ID] DESC
  `);
}

