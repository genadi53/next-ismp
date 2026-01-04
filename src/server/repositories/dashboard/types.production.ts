export type ProductionPlan = {
  shDay: string;
  [key: string]: string | number | null;
};

export type ExcavProductionDetailed = {
  Excav: string;
  LoadLocation: string;
  DumpLocation: string;
  Br: number;
  Ton: number;
  Vol: number;
  Shoptype: string | null;
  toShovel: number;
  toDump: number;
  Queue: number;
  Loading: number;
  FieldDist: number;
  vol_shov_rp: number;
  Cu: number;
};

export type ExcavVol = {
  ExcavName: string;
  DumpLocation: string;
  Vol: number;
};


