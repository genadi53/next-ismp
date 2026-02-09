export type HermesEquipment = {
  Id: number;
  DT_smetka: number;
  Obekt: string;
  DT_Priz1_ceh: string;
  DT_Priz2_kod_zveno: string;
  DT_Priz3_kod_eqmt: string;
  EqmtName: string;
  EqmtGroupName: string;
  PriceMinnaMasa: number | null;
  PriceShists: number | null;
  PriceGrano: number | null;
  Flag_new: number | null;
  Flag_brak: number | null;
  DspEqmt: string | null;
  Active: number | null;
  lrd: Date | null;
};

export type HermesEquipmentNames = {
  Id: number;
  EquipmentName: string;
};

export type CreateEquipmentInput = {
  DT_smetka: number;
  Obekt: string;
  DT_Priz1_ceh: string;
  DT_Priz2_kod_zveno: string;
  DT_Priz3_kod_eqmt: string;
  EqmtName: string;
  EqmtGroupName: string;
  PriceMinnaMasa?: number | undefined;
  PriceShists?: number | undefined;
  PriceGrano?: number | undefined;
  DspEqmt?: string | undefined;
  Active?: number | undefined;
};
