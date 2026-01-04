export type GasMeasurement = {
  GasID: number;
  gasName: string | null;
  gasType: string | null;
  GasValue: number | null;
  MeasuredFrom: string | null;
  MeasuredDuty: string | null;
  MeasuredOn: string | null;
  Horizont: number | null;
  lrd: string | null;
  lrdFrom: string | null;
  Dimension: string | null;
};

export type GasMeasurementEdit = {
  MMrOW: number;
  growid: number;
  GasId: number;
  gasName: string | null;
  gasType: string | null;
  Dimension: string | null;
  work8: string | null;
  work7: string | null;
  work6: string | null;
  work5: string | null;
  work2: string | null;
  GasValue: number | null;
  MeasuredFrom: string | null;
  MeasuredDuty: string | null;
  MeasuredOn: string | null;
  Horizont: number | null;
};

export type CreateGasMeasurementInput = {
  GasID: number;
  GasValue: number;
  MeasuredFrom: string | null;
  MeasuredDuty: string | null;
  MeasuredOn: string;
  Horizont: number;
  lrdFrom: string | null;
};

export type UpdateGasMeasurementInput = {
  GasID: number;
  GasValue: number | null;
  MeasuredFrom: string | null;
  MeasuredDuty: string | null;
  MeasuredOn: string;
  Horizont: number | null;
  lrdFrom: string | null;
  OldMeasuredOn: string;
};

export type GasReference = {
  growid: number;
  GasId: number;
  gasName: string | null;
  gasType: string | null;
  Dimension: string | null;
  work8: string | null;
  work7: string | null;
  work6: string | null;
  work5: string | null;
  work2: string | null;
};

export type SamplerDetails = {
  names: string[];
  duties: string[];
};
