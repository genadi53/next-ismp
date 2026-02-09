export type ReportsRegistry = {
  ID: number;
  ReportName: string;
  RequestID: string | null;
  RequestDate: string;
  RequestDepartment: string | null;
  RequestedFrom: string | null;
  WorkAcceptedFrom: string | null;
  CompletedWorkOn: string | null;
  RequestDescription: string | null;
};

export type CreateReportsRegistryInput = {
  ReportID: number;
  RequestID: string | null;
  RequestDate: string;
  RequestDepartment: string | null;
  RequestedFrom: string | null;
  RequestDescription: string | null;
  ReportFormat: string | null;
  VerificationExistsReport: boolean | null;
  WorkAcceptedFrom: string | null;
  AttachedDocuments: string | null;
  CompletedWorkOn: string | null;
  CompletedWorkDesc: string | null;
  VerificationWorkDesc: string | null;
  ApprovedFrom: string | null;
  CreatedFrom: string | null;
  EditedFrom: string | null;
};

export type UpdateReportsRegistryInput = Omit<
  CreateReportsRegistryInput,
  "CreatedFrom"
>;
