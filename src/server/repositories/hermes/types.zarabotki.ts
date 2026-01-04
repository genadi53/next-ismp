export type HermesZarabotki = {
  Year: number;
  Month: number;
  Department: string;
  Zveno: string;
  Machine: string;
  Indicator: string;
  Indicator_Quantity: number | null;
  Total_Sum: number | null;
};

export type CreateZarabotkiInput = HermesZarabotki;

export type RawExcelDataZarabotki = {
  [key: string]: string | number | null | undefined;
};

export type ZarabotkiEquipment = {
  equipment: string;
  department: string;
  zveno: string;
  indicators: { indicator: string; quantity: number | null; sum: number | null }[];
};

