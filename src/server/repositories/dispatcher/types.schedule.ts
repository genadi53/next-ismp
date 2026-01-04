export type DispatcherSchedule = {
  Id: number;
  Date: string;
  Shift: number;
  dispatcherID: number | null;
  Name: string | null;
  LoginName: string | null;
  lrd: Date | null;
};

export type CreateDispatcherScheduleInput = {
  Date: string;
  Shift: number;
  dispatcherID: number | null;
  Name: string | null;
  LoginName: string | null;
};

export type DayShift = 1 | 2;

export type ExtractedGrafikRow = {
  id: string | undefined;
  name: string | undefined;
  [day: string]: string | number | undefined;
};

