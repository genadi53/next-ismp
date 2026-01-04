export type RequestRepair = {
  ID: number;
  RequestDate: string;
  Equipment: string;
  EquipmentType: string | null;
  RequestRemont: string | null;
  DrillHoles_type: string | null;
  SentReportOn: string | null;
  addUser: string | null;
  lrd: string;
};

export type CreateRequestRepairInput = {
  RequestDate: string;
  Equipment: string;
  EquipmentType: string | null;
  RequestRemont: string | null;
  DrillHoles_type: string | null;
};

export type ExcavatorInfo = {
  FieldId: string;
};


