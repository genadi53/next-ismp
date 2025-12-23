export type BlastingPlan = {
  ID: number;
  OperDate: string;
  BlastingField: string | null;
  Horizont1: string | null;
  Horizont2: string | null;
  Drill: string | null;
  Drill2: string | null;
  Holes: number | null;
  Konturi: number | null;
  MineVolume: number | null;
  TypeBlast: string | null;
  Disabled: boolean | null;
  Note: string | null;
  lrd: string;
  userAdded: string | null;
};

export type CreateBlastingPlanInput = {
  OperDate: string;
  BlastingField: string | null;
  Horizont1: string | null;
  Horizont2: string | null;
  Drill: string | null;
  Drill2: string | null;
  TypeBlast: string | null;
  Holes: number | null;
  Konturi: number | null;
  MineVolume: number | null;
  Disabled: boolean | null;
  Note: string | null;
  userAdded: string | null;
};

export type UpdateBlastingPlanInput = CreateBlastingPlanInput;

