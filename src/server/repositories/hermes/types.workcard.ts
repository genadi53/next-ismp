import type { HermesEquipmentNames } from "./types.equipment";
import type { HermesOperatorNames } from "./types.operator";

export type HermesWorkcard = {
  Id: number;
  Date: Date;
  StartTime: Date | null;
  EndTime: Date | null;
  OperatorId: number | null;
  OperatorName: string | null;
  CodeAction: string | null;
  Duration: number | null;
  Note: string | null;
  WorkingCardId: string | null;
  Bukva: number | null;
  EqmtId: number | null;
};

export type CreateWorkcardInput = {
  Date: Date;
  StartTime: string | null;
  EndTime: string | null;
  OperatorId: number | null;
  CodeAction: number | null;
  Note: string | null;
  WorkingCardId: string | null;
  EqmtId: number | null;
};

export type WorkcardDetails = {
  notes: string[];
  operators: HermesOperatorNames[];
  equipments: HermesEquipmentNames[];
};
