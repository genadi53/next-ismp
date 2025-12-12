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
  Flag_new: boolean | null;
  Flag_brak: boolean | null;
  DspEqmt: string | null;
  Active: boolean | null;
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
  PriceMinnaMasa: number | null;
  PriceShists: number | null;
  PriceGrano: number | null;
  DspEqmt: string | null;
  Active: boolean | null;
};
