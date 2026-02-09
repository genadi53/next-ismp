export type HermesOperator = {
  Id: number;
  OperatorId: number;
  OperatorName: string;
  Dlazhnost: string;
  Department: string;
  Zveno: string;
  lrd: Date | null;
};

export type HermesOperatorNames = {
  Id: number;
  Operator: string;
};

export type CreateOperatorInput = Omit<HermesOperator, "Id" | "lrd">;


