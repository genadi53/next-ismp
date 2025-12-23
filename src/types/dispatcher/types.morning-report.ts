export type MorningReport = {
  ID: number;
  ReportDate: string;
  StartedFromDispatcher: string | null;
  CompletedFromDispatcher: string | null;
  CompletedOn: string | null;
  ReportBody: string | null;
  SentOn: string | null;
  SentFrom: string | null;
};

export type CreateMorningReportInput = {
  ReportDate: string;
  StartedFromDispatcher: string | null;
  ReportBody: string | null;
};

export type UpdateMorningReportInput = {
  CompletedFromDispatcher: string | null;
  CompletedOn: string | null;
  ReportBody: string | null;
};

export type SendMorningReportInput = {
  SentOn: string | null;
  SentFrom: string | null;
};

