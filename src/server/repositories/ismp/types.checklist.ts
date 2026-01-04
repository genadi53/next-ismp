export type MonthChecklist = {
  Id: number;
  YearMonth: number;
  Task: string;
  FinishedBy: string | null;
  lrd: Date | null;
};

export type CreateMonthChecklistInput = {
  YearMonth: number;
  Task: string;
  FinishedBy: string | null;
};


