export type PlanShovels = {
  PlanMonth: string;
  Object: string;
  Horizont: string | null;
  MMtype: string | null;
  Shovel: string | null;
  PlanVol: number | null;
  PlanMass: number | null;
  userAdded: string | null;
};

export type CreatePlanShovelsInput = {
  PlanMonthDay: string;
  Object: string;
  Horizont: string | null;
  MMtype: string | null;
  Shovel: string | null;
  DumpLocation: string | null;
  PlanVol: number | null;
  PlanMass: number | null;
  Etap: string | null;
  userAdded: string | null;
};


