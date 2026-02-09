export type PrestartCheck = {
  ID: number;
  StartDate: string;
  EndDate: string | null;
  Dispatcher: string;
  EndDispatcher: string | null;
  Shift: number;
  FullShiftName: string | null;
  lrd: string | null;
};

export type CreatePrestartCheckInput = {
  Dispatcher: string;
  Shift: number;
};

export type CompletePrestartCheckInput = {
  EndDispatcher: string;
};

export type PrestartStatus = {
  hasUnfinished: boolean;
  currentPrestart: PrestartCheck | null;
};


