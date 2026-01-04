import type { DrillType } from "@/types/types";

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

export type BlastingPlanType = "Контур" | "Поле" | "Поле-Контур" | "Проби";

export const TYPE_BLAST_OPTIONS: BlastingPlanType[] = [
  "Контур",
  "Поле",
  "Поле-Контур",
  "Проби",
];

export const DRILL_SIZES: Record<DrillType, number> = {
  A7: 142,
  A8: 165,
  A9: 165,
  A10: 250,
  C4: 165,
  C5: 165,
  C11: 250,
  C14: 250,
  SK1: 250,
  SK2: 250,
  SK3: 250,
  SK6: 250,
  S12: 250,
  S13: 250,
};
