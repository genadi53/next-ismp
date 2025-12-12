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
