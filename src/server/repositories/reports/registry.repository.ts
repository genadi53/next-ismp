import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  ReportsRegistry,
  CreateReportsRegistryInput,
  UpdateReportsRegistryInput,
} from "@/types/reports";

/**
 * Get all reports registry entries.
 */
export async function getReportsRegistry(): Promise<ReportsRegistry[]> {
  return sqlQuery<ReportsRegistry>(`
    SELECT rptreg.[ID],
           [ReportName],
           [RequestID],
           CONVERT(NVARCHAR, [RequestDate]) AS [RequestDate],
           [RequestDepartment],
           [RequestedFrom],
           [WorkAcceptedFrom],
           CONVERT(NVARCHAR, [CompletedWorkOn]) AS [CompletedWorkOn],
           [RequestDescription]
    FROM [ISMP].[repReg].[ReportsRegistry] AS rptreg 
    INNER JOIN [ISMP].[repReg].[ReportsRegistryList] AS rptList ON rptreg.ReportID = rptList.ID
    ORDER BY ID DESC
  `);
}

/**
 * Create a new reports registry entry.
 */
export async function createReportsRegistry(
  input: CreateReportsRegistryInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("ReportID", input.ReportID);
    request.input("RequestID", input.RequestID);
    request.input("RequestDate", input.RequestDate);
    request.input("RequestDepartment", input.RequestDepartment);
    request.input("RequestedFrom", input.RequestedFrom);
    request.input("RequestDescription", input.RequestDescription);
    request.input("ReportFormat", input.ReportFormat);
    request.input("VerificationExistsReport", input.VerificationExistsReport);
    request.input("WorkAcceptedFrom", input.WorkAcceptedFrom);
    request.input("AttachedDocuments", input.AttachedDocuments);
    request.input("CompletedWorkOn", input.CompletedWorkOn);
    request.input("CompletedWorkDesc", input.CompletedWorkDesc);
    request.input("VerificationWorkDesc", input.VerificationWorkDesc);
    request.input("ApprovedFrom", input.ApprovedFrom);

    await request.query(`
      INSERT INTO [ISMP].[repReg].[ReportsRegistry] (
        [ReportID], [RequestID], [RequestDate], [RequestDepartment],
        [RequestedFrom], [RequestDescription], [ReportFormat],
        [VerificationExistsReport], [WorkAcceptedFrom], [AttachedDocuments],
        [CompletedWorkOn], [CompletedWorkDesc], [VerificationWorkDesc], [ApprovedFrom]
      )
      VALUES (
        @ReportID, @RequestID, @RequestDate, @RequestDepartment,
        @RequestedFrom, @RequestDescription, @ReportFormat,
        @VerificationExistsReport, @WorkAcceptedFrom, @AttachedDocuments,
        @CompletedWorkOn, @CompletedWorkDesc, @VerificationWorkDesc, @ApprovedFrom
      )
    `);
  });
}

/**
 * Update an existing reports registry entry.
 */
export async function updateReportsRegistry(
  id: number,
  input: UpdateReportsRegistryInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("ReportID", input.ReportID);
    request.input("RequestID", input.RequestID);
    request.input("RequestDate", input.RequestDate);
    request.input("RequestDepartment", input.RequestDepartment);
    request.input("RequestedFrom", input.RequestedFrom);
    request.input("RequestDescription", input.RequestDescription);
    request.input("ReportFormat", input.ReportFormat);
    request.input("VerificationExistsReport", input.VerificationExistsReport);
    request.input("WorkAcceptedFrom", input.WorkAcceptedFrom);
    request.input("AttachedDocuments", input.AttachedDocuments);
    request.input("CompletedWorkOn", input.CompletedWorkOn);
    request.input("CompletedWorkDesc", input.CompletedWorkDesc);
    request.input("VerificationWorkDesc", input.VerificationWorkDesc);
    request.input("ApprovedFrom", input.ApprovedFrom);

    await request.query(`
      UPDATE [ISMP].[repReg].[ReportsRegistry]
      SET [ReportID] = @ReportID,
          [RequestID] = @RequestID,
          [RequestDate] = @RequestDate,
          [RequestDepartment] = @RequestDepartment,
          [RequestedFrom] = @RequestedFrom,
          [RequestDescription] = @RequestDescription,
          [ReportFormat] = @ReportFormat,
          [VerificationExistsReport] = @VerificationExistsReport,
          [WorkAcceptedFrom] = @WorkAcceptedFrom,
          [AttachedDocuments] = @AttachedDocuments,
          [CompletedWorkOn] = @CompletedWorkOn,
          [CompletedWorkDesc] = @CompletedWorkDesc,
          [VerificationWorkDesc] = @VerificationWorkDesc,
          [ApprovedFrom] = @ApprovedFrom
      WHERE [ID] = @id
    `);
  });
}
