export type PrestartTruck = {
  FieldId: string;
  FieldSize: number | null;
  FuelRemaining: number | null;
  FieldFueltank: number;
  FieldFuelamt: number | null;
  FieldStatus: number | null;
  Status: string | null;
  Load: string | null;
  LoginId: number | null;
  haveOperator: string;
  Tiedown: string | null;
  FieldEnghr: number | null;
  CurrentLocation: string | null;
  FieldRegionlock: number | null;
  Region: string | null;
  FieldDumplock: number | null;
  FieldExcavlock: number | null;
  DumpLock: string | null;
  ExcavLock: string | null;
  LpType: string | null;
};

export type PrestartExcavator = {
  FieldId: string;
  FieldSize: number | null;
  FieldStatus: number | null;
  Status: string | null;
  LoginId: number | null;
  haveOperator: string;
  Tiedown: string | null;
  FieldEnghr: number | null;
  CurrentLocation: string | null;
  FieldRegionlock: number | null;
  Region: string | null;
  FieldDumplock: number | null;
  DumpLock: string | null;
  FieldExcavlock: number | null;
  ExcavLock: string | null;
  LpType: string | null;
};

export type PrestartShovel = {
  FieldId: string;
  FieldSize: number | null;
  FieldStatus: number | null;
  Status: string | null;
  LoginId: number | null;
  haveOperator: string;
  Tiedown: string | null;
  FieldEnghr: number | null;
  CurrentLocation: string | null;
  Grade: string | null;
  Region: string | null;
  FieldRegionlock: number | null;
  RegionLock: string | null;
  FieldDumplock: number | null;
  FieldDiglock: number | null;
  LoadLock: string | null;
  DumpLock: string | null;
  FieldExcavlock: number | null;
  ExcavLock: string | null;
  LpType: string | null;
  BarTrucks: string | null;
};

