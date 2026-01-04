export type PrestartLocation = {
  Id: number;
  FieldId: string;
  PitId: number | null;
  Pit: string | null;
  RegionId: number | null;
  Region: string | null;
  Elevation: number | null;
  Unit: string | null;
  FieldStatus: number | null;
  Status: string | null;
};

export type PrestartLock = {
  FieldId: string;
  FieldDumplock: number | null;
  Dump: string | null;
  FieldRegionlock: number | null;
  Region: string | null;
};


